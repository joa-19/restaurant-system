import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { listKitchenOrders, updateOrderStatus } from "./kitchen.controller";

const router = Router();

router.use(requireAuth, requireRole("CHEF", "MANAGER"));

router.get("/orders", listKitchenOrders);
router.put("/orders/:id/status", updateOrderStatus);

export default router;