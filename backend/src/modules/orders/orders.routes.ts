import { Router } from "express";
import { createOrder, getOrder } from "./orders.controller";

const router = Router();

router.post("/", createOrder);
router.get("/:id", getOrder);

export default router;