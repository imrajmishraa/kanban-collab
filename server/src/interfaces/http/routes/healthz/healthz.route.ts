import { Router } from "express";
import { healthz } from "../../controllers/healthz/healthz";
import { websocketHealth } from "../../controllers/healthz/websocketHealth";

const router = Router();

router.get("/", healthz);
router.get("/websocket", websocketHealth);

export default router;
