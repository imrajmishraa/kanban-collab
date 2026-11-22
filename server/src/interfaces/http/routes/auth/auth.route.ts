import { Router } from "express";
import { authenticateJWT } from "../../middleware/auth.middleware";
import { validateSchema } from "../../middleware/validate.middleware";
import { rateLimit } from "express-rate-limit";

import {
  me,
  login,
  register,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
} from "../../controllers/auth/authController";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../../validators/auth/authValidator";

/**
 * Password recovery gets its own budget.
 *
 * `authLimiter` cannot be reused: it sets `skipSuccessfulRequests`, and both of
 * these endpoints answer success — the limiter would count nothing. A reset
 * endpoint that counts nothing is a reset endpoint with no limit, and six digits
 * is only a million guesses.
 */
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: "Too many password reset attempts. Try again in 15 minutes.",
});

const router = Router();

router.post("/register", validateSchema(registerSchema), register);
router.post("/login", validateSchema(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

/* Password recovery. Behind its own limiter rather than `authLimiter`: that one
   has `skipSuccessfulRequests`, and both of these answer success — so it would
   count nothing and limit nothing. Six digits is a million combinations, so the
   budget matters. */
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validateSchema(forgotPasswordSchema),
  forgotPassword,
);
router.post(
  "/reset-password",
  passwordResetLimiter,
  validateSchema(resetPasswordSchema),
  resetPassword,
);

router.get("/me", authenticateJWT, me);

export default router;
