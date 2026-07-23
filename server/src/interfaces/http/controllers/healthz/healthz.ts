import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";

const healthz = asyncHandler(async (req, res) => {
  console.log("✅Healthcheck is working");

  return res.status(200).json(
    new ApiResponse(200, "Health check passed", {
      status: "UP",
      timestamp: new Date().toISOString(),
    }),
  );
});

export { healthz };
