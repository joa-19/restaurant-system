import { getIO } from "../../socket";
import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import { OrderStatus } from "@prisma/client";

// Chef only cares about orders that are confirmed and not yet done
const KITCHEN_STATUSES: OrderStatus[] = ["CONFIRMED", "PREPARING"];

export async function listKitchenOrders(_req: AuthRequest, res: Response) {
  const orders = await prisma.order.findMany({
    where: { status: { in: KITCHEN_STATUSES } },
    include: {
      table: true,
      items: { include: { menuItem: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  res.json(orders);
}

export async function updateOrderStatus(req: AuthRequest, res: Response) {
  const id = req.params.id as string;
  const { status } = req.body as { status: OrderStatus };

  const allowedTransitions: Record<string, OrderStatus> = {
    CONFIRMED: "PREPARING",
    PREPARING: "READY",
  };

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  if (allowedTransitions[order.status] !== status) {
    return res.status(400).json({
      error: `Cannot move order from ${order.status} to ${status}`,
    });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status },
  });
  getIO().emit("orders_updated");
  res.json(updated);
}