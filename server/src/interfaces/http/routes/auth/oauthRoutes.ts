import { Router } from "express";

import {
  listProviders,
  startOAuth,
  oauthCallback,
  federatedGoogleAuth,
} from "../../controllers/auth/oauthController";

import { validateSchema } from "../../middleware/validate.middleware";
import {
  oauthCallbackQuerySchema,
  oauthProviderParamSchema,
  googleFederatedAuthSchema,
} from "../../validators/auth/oauthValidators";

const router = Router();

// GET /api/v1/auth/oauth
router.get("/", listProviders);

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
