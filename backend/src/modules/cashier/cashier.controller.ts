import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import { OrderSource, OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { getIO } from "../../socket";

// A. View verified/recent payments (both online + cash), most recent first
export async function listPayments(_req: AuthRequest, res: Response) {
  const orders = await prisma.order.findMany({
    where: { status: { not: "PENDING_PAYMENT" } },
    include: { table: true, payment: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json(orders);
}

// B. Helpers so the cashier's "create order" screen can pick tables + items
export async function listTablesForCashier(_req: AuthRequest, res: Response) {
  const tables = await prisma.table.findMany({
    where: { active: true },
    orderBy: { tableNumber: "asc" },
  });
  res.json(tables);
}

export async function listMenuItemsForCashier(_req: AuthRequest, res: Response) {
  const items = await prisma.menuItem.findMany({
    where: { available: true },
    include: { category: true },
  });
  res.json(items);
}

// C. Create a cash order — cashier confirms cash was received immediately,
// so this order skips PENDING_PAYMENT and goes straight to CONFIRMED.
export async function createCashOrder(req: AuthRequest, res: Response) {
  const { tableId, items } = req.body as {
    tableId: string;
    items: { menuItemId: string; quantity: number }[];
  };

  if (!tableId || !items || items.length === 0) {
    return res.status(400).json({ error: "tableId and items are required" });
  }

  const table = await prisma.table.findUnique({ where: { id: tableId } });
  if (!table || !table.active) {
    return res.status(404).json({ error: "Table not found" });
  }

  const menuItemIds = items.map((i) => i.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
  });

  if (menuItems.length !== menuItemIds.length) {
    return res.status(400).json({ error: "One or more menu items not found" });
  }

  let total = 0;
  const orderItemsData = items.map((input) => {
    const menuItem = menuItems.find((m) => m.id === input.menuItemId)!;
    const unitPrice = Number(menuItem.price);
    const subtotal = unitPrice * input.quantity;
    total += subtotal;

    return {
      menuItemId: menuItem.id,
      quantity: input.quantity,
      unitPrice,
      subtotal,
    };
  });

  const order = await prisma.order.create({
    data: {
      tableId,
      source: OrderSource.CASHIER,
      status: OrderStatus.CONFIRMED, // cash confirmed immediately, straight to kitchen
      total,
      createdById: req.user!.userId,
      items: { create: orderItemsData },
      payment: {
        create: {
          provider: "cash",
          paymentMethod: PaymentMethod.CASH,
          amount: total,
          currency: "ETB",
          status: PaymentStatus.PAID,
          verifiedAt: new Date(),
        },
      },
    },
    include: { items: true, payment: true },
  });

  getIO().emit("orders_updated"); // chef dashboard picks it up instantly

  res.status(201).json(order);
}
