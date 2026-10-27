import { timingSafeEqual } from "node:crypto";

import { Router, type Request, type Response } from "express";

import { ENV } from "../../../../config/env";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { schedulerLogger } from "../../../../infrastructure/logging/childLogger";
import {
  isScheduledJobName,
  runJob,
  SCHEDULED_JOB_NAMES,
} from "../../../../infrastructure/scheduler/cron";

/**
 * HTTP trigger for scheduled jobs.
 *
 * Serverless has no long-lived process, so `node-cron` cannot run there. This
 * route exposes the same job registry over HTTP so an external scheduler can
 * invoke it: Vercel Cron, a GitHub Actions schedule, or any cron service.
 *
 *   GET /api/v1/internal/cron/:job
 *   Authorization: Bearer $CRON_SECRET
 *
 * Fail-closed: with no `CRON_SECRET` configured the route refuses every
 * request rather than running jobs for anyone who finds the URL.
 */
const router = Router();

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function isAuthorized(req: Request): boolean {
  const secret = ENV.CRON_SECRET;
  const header = req.headers.authorization;

  if (!secret || typeof header !== "string") {
    return false;
  }

  return safeEqual(header, `Bearer ${secret}`);
}

router.get(
  "/:job",
  asyncHandler<{ job: string }>(async (req: Request, res: Response) => {
    if (!ENV.CRON_SECRET) {
      schedulerLogger.error(
        {},
        "CRON_SECRET is not configured — refusing to run a scheduled job.",
      );

      res
        .status(503)
        .json({ success: false, error: "CRON_SECRET is not configured" });

      return;
    }

    if (!isAuthorized(req)) {
      schedulerLogger.warn(
        { ip: req.ip },
        "Rejected unauthorized scheduled job invocation.",
      );

      res.status(401).json({ success: false, error: "Unauthorized" });

      return;
    }

    // `noUncheckedIndexedAccess` widens Express's path params to
    // `string | undefined`, so narrow to a string before the type guard.
    const job = req.params["job"] ?? "";

    if (!isScheduledJobName(job)) {
      res.status(404).json({
        success: false,
        error: "Unknown job",
        jobs: SCHEDULED_JOB_NAMES,
      });

      return;
    }

    const startedAt = Date.now();

    try {
      await runJob(job);

      const durationMs = Date.now() - startedAt;

      schedulerLogger.info(
        { job, durationMs, trigger: "http" },
        "Scheduled job completed.",
      );

      res.status(200).json({ success: true, job, durationMs });
    } catch (error) {
      schedulerLogger.error(
        {
          err: error,
          job,
          durationMs: Date.now() - startedAt,
          trigger: "http",
        },
        "Scheduled job failed.",
      );

      res.status(500).json({ success: false, job, error: "Job failed" });
    }
  }),
);

export default router;
