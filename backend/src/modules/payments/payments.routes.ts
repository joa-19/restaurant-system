import { Router } from "express";
import { initiate, manualVerify, webhookCallback } from "./payments.controller";

const router = Router();

router.post("/initiate", initiate);
router.post("/verify/:orderId", manualVerify);
router.get("/callback", webhookCallback);
router.post("/callback", webhookCallback);

export default router;