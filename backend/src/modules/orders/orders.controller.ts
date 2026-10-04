import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { OrderSource, OrderStatus } from "@prisma/client";

interface OrderItemInput {
  menuItemId: string;
  quantity: number;
}

export async function createOrder(req: Request, res: Response) {
  const { tableId, items } = req.body as {
    tableId: string;
    items: OrderItemInput[];
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
      source: OrderSource.CUSTOMER_QR,
      status: OrderStatus.PENDING_PAYMENT,
      total,
      items: { create: orderItemsData },
    },
    include: { items: true },
  });

  res.status(201).json(order);
}

export async function getOrder(req: Request, res: Response) {
  const id = req.params.id as string;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { menuItem: true } }, table: true, payment: true },
  });

  if (!order) return res.status(404).json({ error: "Order not found" });

  res.json(order);
}