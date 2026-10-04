import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export async function getPublicMenu(req: Request, res: Response) {
  const { table } = req.query;

  if (!table || typeof table !== "string") {
    return res.status(400).json({ error: "table query param is required" });
  }

  const tableRecord = await prisma.table.findUnique({
    where: { id: table },
    include: { restaurant: true },
  });

  if (!tableRecord || !tableRecord.active) {
    return res.status(404).json({ error: "Table not found" });
  }

  const categories = await prisma.category.findMany({
    where: { restaurantId: tableRecord.restaurantId },
    include: {
      menuItems: { where: { available: true } },
    },
  });

  res.json({
    restaurant: { name: tableRecord.restaurant.name },
    table: { id: tableRecord.id, tableNumber: tableRecord.tableNumber },
    categories,
  });
}