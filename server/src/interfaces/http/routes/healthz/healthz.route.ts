import { Router } from "express";
import { healthz, readyz } from "../../controllers/healthz/healthz";
import { websocketHealth } from "../../controllers/healthz/websocketHealth";

const router = Router();

router.get("/healthz", healthz);
router.get("/readyz", readyz);

router.get("/websocket", websocketHealth);

export default router;
