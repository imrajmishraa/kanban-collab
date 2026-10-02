import type { Response } from "express";

import { getDashboard } from "../../../../application/dashboard/getDashboard";
import { dashboardControllerLogger } from "../../../../infrastructure/logging/childLogger";
import { ApiError } from "../../../../shared/utils/ApiError";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";

const getDashboardController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Guard instead of `req.user!.userId` — the non-null assertion hides
    // the (rare but real) case of this route being mounted without the
    // auth middleware in front of it, which would crash with a TypeError.
    if (!req.user) {
      throw ApiError.unauthorized("Authentication required.");
    }

    const userId = req.user.userId;

    dashboardControllerLogger.info(
      {
        userId,
      },
      "Fetching dashboard",
    );

    const dashboard = await getDashboard(userId);

    dashboardControllerLogger.info(
      {
        userId,
        workspaceCount: dashboard.stats.workspaceCount,
        boardCount: dashboard.stats.boardCount,
        activeTaskCount: dashboard.stats.activeTaskCount,
      },
      "Dashboard fetched successfully",
    );

    return res.status(200).json(
      new ApiResponse(200, "Dashboard fetched successfully", {
        data: dashboard,
      }),
    );
  },
);

export { getDashboardController };
