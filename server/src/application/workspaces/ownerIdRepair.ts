import { WorkspaceModel } from "../../infrastructure/db/mongoose/schemas";
import { workspaceCleanupJobLogger as log } from "../../infrastructure/logging/childLogger";

/**
 * Point `ownerId` back at somebody who is actually an owner.
 *
 * `ownerId` is written at creation and read as the permission for delete and
 * cancel — but nothing kept it in step with `members[].role`, so rows drifted:
 * a workspace whose `ownerId` names a demoted member, or a member who left.
 *
 * The permission itself now checks the role, so a drifted row is no longer a
 * security hole — this keeps the field meaningful for display, and for anything
 * that still reads it. Idempotent, and safe to run on every purge tick: it only
 * touches rows where the pointer does not name an owner.
 *
 * A workspace with no owner member is left alone and logged: inventing one would
 * be a worse decision than reporting it.
 */
export async function repairWorkspaceOwnerIds(): Promise<{
  scanned: number;
  repaired: number;
  ownerless: number;
}> {
  const workspaces = await WorkspaceModel.find({
    status: { $in: ["active", "deletion_pending"] },
  })
    .select("_id ownerId members")
    .lean();

  let repaired = 0;
  let ownerless = 0;

  for (const workspace of workspaces) {
    const stillOwner = workspace.members.some(
      (member) =>
        member.userId.equals(workspace.ownerId) && member.role === "owner",
    );

    if (stillOwner) {
      continue;
    }

    const next = workspace.members.find((member) => member.role === "owner");

    if (!next) {
      ownerless += 1;

      log.warn(
        { workspaceId: workspace._id.toString() },
        "Workspace has no owner member; ownerId left untouched.",
      );

      continue;
    }

    await WorkspaceModel.updateOne(
      { _id: workspace._id },
      { $set: { ownerId: next.userId } },
    );

    repaired += 1;
  }

  return { scanned: workspaces.length, repaired, ownerless };
}
