import { Router } from "express";
import { login, register, logout, refresh } from "../../controllers/auth/auth";
import { validateSchema } from "../../middleware/validate.middleware";
import { authenticateJWT } from "../../middleware/auth.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../../validators/auth/auth.validators";
import rateLimit from "express-rate-limit";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

// Register new user
router
  .route("/register")
  .post(validateSchema(registerSchema), register);

// Login user
router.route("/login").post(validateSchema(loginSchema), login);

// Logout user
router.route("/logout").post(authenticateJWT, logout);

// Refresh access token
router
  .route("/refresh")
  .get(authenticateJWT)
  .post(validateSchema(refreshTokenSchema), refresh);

export default router;
