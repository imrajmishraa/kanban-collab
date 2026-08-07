import cron from "node-cron";
import { schedulerLogger } from "../logging/childLogger";
import { workspaceDeletionJob } from "../../jobs/workspaceDeletion.job";


export const startCronJobs = (): void => {
  cron.schedule("0 * * * *", async () => {
    try {
      await workspaceDeletionJob();
    } catch (error) {
      schedulerLogger.error(
        { err: error },
        "Scheduled workspace deletion job failed",
      );
    }
  });

  schedulerLogger.info("Cron jobs started successfully");
};
