import { Router } from "express";
import { healthz } from "../../controllers/healthz/healthz";
import { websocketHealth } from "../../controllers/healthz/websocketHealth";

const router = Router();

router.get("/healthz", healthz);
router.get("/healthz/websocket", websocketHealth);

export default router;
