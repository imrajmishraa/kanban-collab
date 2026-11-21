/**
 * Push a test notification to one account.
 *
 *   npm run notify -- --email you@example.com
 *   npm run notify -- --email you@example.com --type CARD_OVERDUE --count 5
 *   npm run notify -- --email you@example.com --board Repos --dry-run
 *
 * Needs `MONGODB_URI` in the environment (`.env` is loaded by `config/env.ts`).
 * The rows it writes are real: they appear in the inbox, count towards the unread
 * badge, and expire 90 days after they are read, exactly like a production one.
 * The message says where they came from, so they are safe to delete.
 *
 * `--stable-key` reuses one dedupe key, so running the same command twice proves
 * the `{ userId, dedupeKey }` unique index is doing its job.
 */
import "dotenv/config";

/*
 * Nothing from `src/` is imported at module load, on purpose.
 *
 * `config/env.ts` validates the environment and exits when something is missing,
 * so a static import of anything that reaches it would make `--help` — and any
 * argument error — die with "MONGODB_URI is required" before the user's typo is
 * ever read. The database modules are therefore pulled in inside `main()`, after
 * the arguments are parsed.
 */
import { NOTIFICATION_TYPES } from "../src/infrastructure/db/mongoose/schemas";
import type { NotificationType } from "../src/infrastructure/db/mongoose/schemas";

/**
 * A bad flag or a missing value — the user's mistake, printed without a stack.
 * Local rather than the application's `PushTargetError`, because that module
 * cannot be imported before the arguments are parsed.
 */
class UsageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsageError";
  }
}

interface Args {
  email: string;
  type: NotificationType;
  title?: string;
  message?: string;
  workspace?: string;
  board?: string;
  count: number;
  stableKey: boolean;
  dryRun: boolean;
  list: boolean;
}

const USAGE = `
Push a test notification.

  --email <address>     required; the account that will receive it
  --type <TYPE>         one of: ${NOTIFICATION_TYPES.join(", ")}
                        (default CARD_ASSIGNED)
  --title <text>        default: a human label for the type
  --message <text>      default: a line saying this is test data
  --workspace <id>      default: the account's first workspace
  --board <id|name>     attach the notification to a board
  --count <n>           create n distinct rows (1-50, default 1)
  --stable-key          reuse one dedupe key, to prove dedupe works
  --dry-run             resolve and print, write nothing
  --list                print the 10 most recent notifications, then exit
`;

function parseArgs(argv: string[]): Args {
  const args: Args = {
    email: "",
    type: "CARD_ASSIGNED",
    count: 1,
    stableKey: false,
    dryRun: false,
    list: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];

    switch (flag) {
      case "--email":
        args.email = argv[++index] ?? "";
        break;
      case "--type": {
        const value = (argv[++index] ?? "").toUpperCase() as NotificationType;
        if (!NOTIFICATION_TYPES.includes(value)) {
          throw new UsageError(
            `Unknown --type "${value}". One of: ${NOTIFICATION_TYPES.join(", ")}`,
          );
        }
        args.type = value;
        break;
      }
      case "--title":
        args.title = argv[++index] ?? "";
        break;
      case "--message":
        args.message = argv[++index] ?? "";
        break;
      case "--workspace":
        args.workspace = argv[++index] ?? "";
        break;
      case "--board":
        args.board = argv[++index] ?? "";
        break;
      case "--count":
        args.count = Number.parseInt(argv[++index] ?? "1", 10) || 1;
        break;
      case "--stable-key":
        args.stableKey = true;
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      case "--list":
        args.list = true;
        break;
      case "--help":
      case "-h":
        console.log(USAGE);
        process.exit(0);
        break;
      default:
        throw new UsageError(`Unknown flag "${flag}".${USAGE}`);
    }
  }

  if (!args.email) throw new UsageError(`--email is required.${USAGE}`);

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  /* Dynamic, so `--help` and a bad flag do not need a database or a valid
     environment: `config/env.ts` validates at import time and exits the process. */
  const { connectDB } =
    await import("../src/infrastructure/db/mongoose/dbConnect");

  const { pushTestNotifications } =
    await import("../src/application/notifications/testNotification");

  await connectDB();

  if (args.list) {
    const { NotificationModel } =
      await import("../src/infrastructure/db/mongoose/schemas");

    const rows = await NotificationModel.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select("_id userId type title isRead createdAt")
      .lean();

    console.table(
      rows.map((row) => ({
        id: row._id.toString(),
        type: row.type,
        title: row.title,
        read: row.isRead,
        at: row.createdAt.toISOString(),
      })),
    );

    process.exit(0);
  }

  const result = await pushTestNotifications({
    email: args.email,
    type: args.type,
    title: args.title,
    message: args.message,
    workspaceId: args.workspace,
    board: args.board,
    count: args.count,
    stableDedupeKey: args.stableKey,
    dryRun: args.dryRun,
  });

  const { target } = result;

  console.log(
    `${result.dryRun ? "Would push to" : "Pushed to"} ${target.email} — ${target.role} in "${target.workspaceName}"${target.boardName ? ` / board "${target.boardName}"` : ""}`,
  );
  console.log(
    `  type ${args.type} · created ${result.created} · deduped ${result.deduped}`,
  );

  if (result.ids.length > 0) {
    console.log(`  ids: ${result.ids.join(", ")}`);
    console.log(
      "\nOpen the inbox as that account — the rows are real, and the message says where they came from.",
    );
  }

  process.exit(0);
}

void main().catch((error: unknown) => {
  /* `instanceof` would need the class in scope, and importing it here defeats
     the point of the dynamic import above — the name is enough. */
  const expected =
    error instanceof Error &&
    (error.name === "UsageError" || error.name === "PushTargetError");

  if (expected) {
    console.error(`\n${error.message}`);
    process.exit(1);
  }

  console.error(error);
  process.exit(1);
});
