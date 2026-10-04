import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import {
  createStaff,
  listStaff,
  toggleActive,
  resetPassword,
} from "./staff.controller";
import { getSalesSummary, getOrderHistory } from "./sales.controller";

const router = Router();

router.use(requireAuth, requireRole("MANAGER"));

router.post("/staff", createStaff);
router.get("/staff", listStaff);
router.put("/staff/:id/active", toggleActive);
router.put("/staff/:id/password", resetPassword);

router.get("/sales/summary", getSalesSummary);
router.get("/sales/orders", getOrderHistory);

export default router;