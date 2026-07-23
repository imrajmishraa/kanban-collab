import { Router } from "express";
import { healthz } from "../../controllers/healthz/healthz"

const router = Router();

router.get("/healthz", healthz);

export default router;
