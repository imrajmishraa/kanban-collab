import { Router } from "express";
import { authenticateJWT } from "../../middleware/auth.middleware";
import { validateSchema } from "../../middleware/validate.middleware";
import {
  me,
  login,
  register,
  logout,
  refresh,
} from "../../controllers/auth/authController";
import {
  loginSchema,
  registerSchema,
} from "../../validators/auth/authValidator";

const router = Router();

router.post("/register", validateSchema(registerSchema), register);
router.post("/login", validateSchema(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

router.get("/me", authenticateJWT, me);

export default router;
