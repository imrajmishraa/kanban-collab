/**
 * Find `yjsupdates` rows that cannot be applied to a document, and clear them.
 *
 * A row holds one full Yjs state update per board. A truncated blob — or one
 * written in a shape Yjs cannot read — makes `bindState` fail, and since it
 * rethrows, the board does not open at all. The server now quarantines such a row
 * on load; this is the same repair for the whole collection, so the damage can be
 * seen and cleared in one pass instead of board by board.
 *
 * Dry run by default: it prints what it found and changes nothing.
 *
 *   npx tsx server/scripts/repair-corrupt-yjs.ts            # report only
 *   npx tsx server/scripts/repair-corrupt-yjs.ts --apply    # delete the bad rows
 *
 * Deleting is safe in the sense that matters: the blob is unreadable, so nothing
 * that could have been loaded is lost. Mongo still holds the board's columns and
 * cards, and the client seeds the document from them on the next open.
 */
import connectDB from "../src/infrastructure/db/mongoose/dbConnect";
import { YjsUpdateModel } from "../src/infrastructure/db/mongoose/schemas";
import { canDecodeYjsUpdate } from "../src/interfaces/websockets/collaboration/persistence/yjsUpdateCodec";

async function main() {
  const apply = process.argv.includes("--apply");

  await connectDB();

  const rows = await YjsUpdateModel.find({}).select("docName update").lean();

  const corrupt: Array<{ docName: string; bytes: number }> = [];

  for (const row of rows) {
    if (canDecodeYjsUpdate(row.update)) {
      continue;
    }

    corrupt.push({ docName: row.docName, bytes: row.update.length });
  }

  console.log(`scanned ${rows.length} rows, ${corrupt.length} unreadable`);

  for (const row of corrupt) {
    console.log(`  ${row.docName}  (${row.bytes} bytes)`);
  }

  if (corrupt.length === 0) {
    process.exit(0);
  }

  if (!apply) {
    console.log("dry run — pass --apply to delete these rows");
    process.exit(0);
  }

  const result = await YjsUpdateModel.deleteMany({
    docName: { $in: corrupt.map((row) => row.docName) },
  });

  console.log(`deleted ${result.deletedCount} rows`);

  process.exit(0);
}

void main().catch((error) => {
  console.error("yjs repair failed:", error);
  process.exit(1);
});
