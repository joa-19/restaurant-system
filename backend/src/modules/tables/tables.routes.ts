import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.middleware";
import { createTable, listTables } from "./tables.controller";

const router = Router();

router.use(requireAuth, requireRole("MANAGER"));

router.post("/", createTable);
router.get("/", listTables);

export default router;