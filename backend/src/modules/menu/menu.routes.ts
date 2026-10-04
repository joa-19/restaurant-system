import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import {
  createCategory,
  listCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "./menu.controller";

const router = Router();

router.use(requireAuth, requireRole("MANAGER"));

router.post("/categories", createCategory);
router.get("/categories", listCategories);

router.post("/items", createMenuItem);
router.put("/items/:id", updateMenuItem);
router.delete("/items/:id", deleteMenuItem);

export default router;