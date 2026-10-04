import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import {
  listPayments,
  listTablesForCashier,
  listMenuItemsForCashier,
  createCashOrder,
} from "./cashier.controller";

const router = Router();

router.use(requireAuth, requireRole("CASHIER", "MANAGER"));

router.get("/payments", listPayments);
router.get("/tables", listTablesForCashier);
router.get("/menu-items", listMenuItemsForCashier);
router.post("/orders", createCashOrder);

export default router;