import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

export async function getSalesSummary(_req: AuthRequest, res: Response) {
  const orders = await prisma.order.findMany({
    where: { status: { not: "CANCELLED" } },
    include: { payment: true },
  });

  const paidOrders = orders.filter((o) => o.status !== "PENDING_PAYMENT");
  const totalSales = paidOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const byPaymentMethod: Record<string, number> = {};
  paidOrders.forEach((o) => {
    const method = o.payment?.paymentMethod ?? "UNKNOWN";
    byPaymentMethod[method] = (byPaymentMethod[method] || 0) + Number(o.total);
  });

  const byDate: Record<string, number> = {};
  paidOrders.forEach((o) => {
    const date = o.createdAt.toISOString().split("T")[0];
    byDate[date] = (byDate[date] || 0) + Number(o.total);
  });

  res.json({
    totalSales,
    totalOrders: orders.length,
    paidOrdersCount: paidOrders.length,
    byPaymentMethod,
    byDate,
  });
}

export async function getOrderHistory(_req: AuthRequest, res: Response) {
  const orders = await prisma.order.findMany({
    include: { table: true, payment: true, items: { include: { menuItem: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  res.json(orders);
}