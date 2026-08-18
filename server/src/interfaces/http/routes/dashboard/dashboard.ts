import { Router } from "express";

import { getDashboardController } from "../../controllers/dashboard/dashboard";
import { authenticateJWT } from "../../middleware/auth.middleware";

const router = Router();

router.get("/dashboard", authenticateJWT, getDashboardController);

export default router;
