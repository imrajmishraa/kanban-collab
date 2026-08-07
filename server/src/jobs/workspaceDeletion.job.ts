import { permanentlyDeleteWorkspace } from "../application/workspaces/permanentlyDeleteWorkspace";
import { WorkspaceModel } from "../infrastructure/db/mongoose/schemas";
import { workspaceJobSchedulerLogger } from "../infrastructure/logging/childLogger";


export const workspaceDeletionJob = async (): Promise<void> => {
  try {
    const now = new Date();

    const expiredWorkspaces = await WorkspaceModel.find({
      status: "deletion_pending",
      deletionScheduledFor: { $lte: now },
    });

    workspaceJobSchedulerLogger.info(
      {
        count: expiredWorkspaces.length,
      },
      "Workspace deletion job started",
    );

    for (const workspace of expiredWorkspaces) {
      workspaceJobSchedulerLogger.info(
        {
          workspaceId: workspace._id,
        },
        "Processing expired workspace",
      );

      // Permanent deletion
      await permanentlyDeleteWorkspace(workspace._id.toString());
    }  
  } catch (error) {
     workspaceJobSchedulerLogger.error(
      {
        err: error,
      },
      "Workspace deletion job failed",
    );

    throw error;
  }
}
