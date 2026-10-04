import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import { getIO } from "../../socket";

export async function listReadyOrders(_req: AuthRequest, res: Response) {
  const orders = await prisma.order.findMany({
    where: { status: "READY" },
    include: {
      table: true,
      items: { include: { menuItem: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  res.json(orders);
}

export async function markDelivered(req: AuthRequest, res: Response) {
  const id = req.params.id as string;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return res.status(404).json({ error: "Order not found" });

  if (order.status !== "READY") {
    return res.status(400).json({ error: `Cannot deliver an order that is ${order.status}` });
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: "DELIVERED" },
  });

  getIO().emit("orders_updated");
  res.json(updated);
}