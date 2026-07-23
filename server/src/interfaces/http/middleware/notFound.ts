import { Request, Response } from "express";
import { asyncHandler } from "../../../shared/utils/asyncHandler";

export const notFoundHandler = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: `Cannot ${req.method} ${req.originalUrl}`,
      },
    });
  }
);