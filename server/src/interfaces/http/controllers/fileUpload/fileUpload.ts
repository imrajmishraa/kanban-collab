import { createHmac, randomUUID } from "node:crypto";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { ApiError } from "../../../../shared/utils/ApiError";
import { ENV } from "../../../../config/env";
import { fileUploadControllerLogger } from "../../../../infrastructure/logging/childLogger";

/** Guard instead of `req.user!` — see the dashboard controller for rationale. */
function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required.");
  }
  return req.user.userId;
}

/** ImageKit upload tokens are valid for 10 minutes. */
const AUTH_TTL_SECONDS = 600;

/**
 * GET /api/v1/attachments/imagekit-auth
 *
 * ImageKit client-side upload authentication (T15). The browser uploads the
 * file straight to ImageKit with these short-lived credentials, so file bytes
 * never transit this server — replacing the old hard-coded mock S3 presign.
 *
 * `signature = HMAC-SHA1(privateKey, token + expire)`, hex encoded, which is
 * exactly what ImageKit's upload API expects.
 */
const getImageKitAuth = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);

  const publicKey = ENV.IMAGEKIT_PUBLIC_KEY;
  const privateKey = ENV.IMAGEKIT_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw ApiError.internal("ImageKit is not configured on this server.");
  }

  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + AUTH_TTL_SECONDS;
  const signature = createHmac("sha1", privateKey)
    .update(token + expire)
    .digest("hex");

  fileUploadControllerLogger.info(
    { userId, expire },
    "ImageKit upload auth issued",
  );

  return res.status(200).json(
    new ApiResponse(200, "ImageKit auth generated successfully", {
      token,
      expire,
      signature,
      publicKey,
      urlEndpoint: ENV.IMAGEKIT_URL_ENDPOINT ?? null,
    }),
  );
});

export { getImageKitAuth };
