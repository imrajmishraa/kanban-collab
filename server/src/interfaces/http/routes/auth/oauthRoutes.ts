import { Router } from "express";

import {
  listProviders,
  startOAuth,
  oauthCallback,
  federatedGoogleAuth,
  verifyOAuth,
} from "../../controllers/auth/oauthController";

import { validateSchema } from "../../middleware/validate.middleware";
import {
  oauthCallbackQuerySchema,
  oauthProviderParamSchema,
  googleFederatedAuthSchema,
  verifyOAuthSchema,
} from "../../validators/auth/oauthValidators";

const router = Router();

// GET /api/v1/auth/oauth
router.get("/", listProviders);

// POST /api/v1/auth/oauth/verify (Unified direct token/code verification)
router.post(
  "/verify",
  validateSchema({ body: verifyOAuthSchema }),
  verifyOAuth,
);

// POST /api/v1/auth/oauth/google/token (Direct Google Identity Services token exchange)
router.post(
  "/google/token",
  validateSchema({ body: googleFederatedAuthSchema }),
  federatedGoogleAuth,
);

// GET /api/v1/auth/oauth/:provider
router.get(
  "/:provider",
  validateSchema({ params: oauthProviderParamSchema }),
  startOAuth,
);

// GET /api/v1/auth/oauth/:provider/callback
router.get(
  "/:provider/callback",
  validateSchema({
    params: oauthProviderParamSchema,
    query: oauthCallbackQuerySchema,
  }),
  oauthCallback,
);

export default router;
