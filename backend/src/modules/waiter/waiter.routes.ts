import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { listReadyOrders, markDelivered } from "./waiter.controller";

const router = Router();

router.use(requireAuth, requireRole("WAITER", "MANAGER"));

router.get("/orders", listReadyOrders);
router.put("/orders/:id/deliver", markDelivered);

export default router;