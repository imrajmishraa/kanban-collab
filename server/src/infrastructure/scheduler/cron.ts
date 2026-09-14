// server/src/infrastructure/scheduler/index.ts
import cron, { type ScheduledTask } from "node-cron";

import { ENV } from "../../config/env";
import { schedulerLogger } from "../logging/childLogger";

import { workspaceDeletionJob } from "../../jobs/workspaceDeletion.job";
import { yjsSnapshotJob } from "../../jobs/yjsSnapshot.job";
import { notificationDueReminderJob } from "../../jobs/notificationDueReminder.job";
import { notificationDigestJob } from "../../jobs/notificationDigest.job";

interface CronJobDefinition {
  /** Human-readable name — shows up in logs and shutdown messages. */
  name: string;
  /** 5-field cron expression. */
  schedule: string;
  /** The async job function to run. */
  handler: () => Promise<void>;
  /** Whether to run once at boot (before the first tick). Default: false. */
  runOnStartup?: boolean;
}

/**
 * Registry of every scheduled job.
 *
 * Adding a job:
 *   1. Create `server/src/jobs/<name>.job.ts` exporting an async function
 *   2. Add an entry here
 *   3. Add the matching cron expression to `env.ts` if you want it configurable
 */
function buildJobDefinitions(): CronJobDefinition[] {
  return [
    {
      name: "workspace-cleanup",
      schedule: ENV.WORKSPACE_CLEANUP_CRON,
      handler: workspaceDeletionJob,
    },
    {
      name: "yjs-snapshot",
      schedule: "*/5 * * * *",
      handler: yjsSnapshotJob,
    },
    {
      name: "notification-due-reminder",
      schedule: ENV.NOTIF_DUE_REMINDER_CRON,
      handler: notificationDueReminderJob,
    },
    {
      name: "notification-digest",
      schedule: ENV.NOTIF_DIGEST_CRON,
      handler: notificationDigestJob,
    },
  ];
}

/** Active tasks — kept so we can stop them on shutdown. */
const scheduledTasks: Array<{ name: string; task: ScheduledTask }> = [];

/**
 * Register all cron jobs.
 *
 * Behavior:
 *   - No-op when `SCHEDULER_ENABLED=false` (tests, one-off scripts, etc.)
 *   - Runs jobs in the server's local timezone unless `SCHEDULER_TIMEZONE` is set
 *   - Prevents overlap — a slow run won't have concurrent siblings
 *   - All job errors are caught, logged, and do NOT crash the process
 */
export function startCronJobs(): void {
  if (!ENV.SCHEDULER_ENABLED) {
    schedulerLogger.info(
      { reason: "SCHEDULER_ENABLED=false" },
      "Cron scheduler disabled — no jobs registered.",
    );
    return;
  }

  const jobs = buildJobDefinitions();

  for (const { name, schedule, handler, runOnStartup } of jobs) {
    const task = cron.schedule(
      schedule,
      async () => {
        const startedAt = Date.now();

        try {
          await handler();

          schedulerLogger.info(
            { job: name, durationMs: Date.now() - startedAt },
            "Scheduled job completed.",
          );
        } catch (error) {
          schedulerLogger.error(
            {
              err: error,
              job: name,
              durationMs: Date.now() - startedAt,
            },
            "Scheduled job failed.",
          );
          // Swallow — a failing job must not crash the process or
          // stop subsequent ticks. The error is already logged.
        }
      },
      {
        name,
        timezone: process.env.SCHEDULER_TIMEZONE ?? "UTC",
        noOverlap: true, // prevents concurrent runs of the same job
      },
    );

    scheduledTasks.push({ name, task });

    if (runOnStartup) {
      // Fire once, then let cron take over
      void (async () => {
        try {
          await handler();
        } catch (error) {
          schedulerLogger.error(
            { err: error, job: name },
            "Startup run of scheduled job failed.",
          );
        }
      })();
    }
  }

  schedulerLogger.info(
    {
      count: jobs.length,
      jobs: jobs.map((j) => ({ name: j.name, schedule: j.schedule })),
      timezone: process.env.SCHEDULER_TIMEZONE ?? "UTC",
    },
    "Cron scheduler started.",
  );
}

/**
 * Stop every registered cron job.
 *
 * Wire this into your SIGTERM/SIGINT handler in `main.ts`:
 *
 *   process.on("SIGTERM", () => { stopCronJobs(); server.close(); });
 */
export function stopCronJobs(): void {
  if (scheduledTasks.length === 0) return;

  for (const { name, task } of scheduledTasks) {
    task.stop();
    schedulerLogger.info({ job: name }, "Scheduled job stopped.");
  }

  scheduledTasks.length = 0;
}
