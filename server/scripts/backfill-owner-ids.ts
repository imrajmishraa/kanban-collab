/**
 * One-off repair for workspaces whose `ownerId` no longer names an owner.
 *
 * `ownerId` was written once, at creation, and never updated when roles changed
 * — so a workspace could keep pointing at a demoted member, or at somebody who
 * had left. The delete and cancel paths now check the owner *role* instead, so
 * this is about keeping the field honest rather than closing a hole.
 *
 * Idempotent. The purge job runs the same repair every tick, so this script is
 * only for "do it now" — and for a database where the job is not scheduled.
 *
 * Run once: `npx tsx server/scripts/backfill-owner-ids.ts`
 */
import connectDB from "../src/infrastructure/db/mongoose/dbConnect";
import { repairWorkspaceOwnerIds } from "../src/application/workspaces/ownerIdRepair";

async function main() {
  await connectDB();

  const result = await repairWorkspaceOwnerIds();

  console.log(
    `ownerId repair: scanned ${result.scanned}, repaired ${result.repaired}, ` +
      `ownerless ${result.ownerless}`,
  );

  process.exit(0);
}

void main().catch((error) => {
  console.error("ownerId repair failed:", error);
  process.exit(1);
});
