import type { Response } from "express";

import { getDashboard } from "../../../../application/dashboard/getDashboard";
import { dashboardControllerLogger } from "../../../../infrastructure/logging/childLogger";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";

const getDashboardController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;

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
