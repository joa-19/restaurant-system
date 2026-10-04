import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

async function getDefaultRestaurantId() {
  const restaurant = await prisma.restaurant.findFirst();
  if (!restaurant) throw new Error("No restaurant found. Did you seed the DB?");
  return restaurant.id;
}

export async function createTable(req: AuthRequest, res: Response) {
  const { tableNumber } = req.body;

  if (!tableNumber) {
    return res.status(400).json({ error: "tableNumber is required" });
  }

  const restaurantId = await getDefaultRestaurantId();

  try {
    const table = await prisma.table.create({
      data: { restaurantId, tableNumber },
    });

    const qrPath = `/menu?table=${table.id}`;

    const updated = await prisma.table.update({
      where: { id: table.id },
      data: { qrCode: qrPath },
    });

    res.status(201).json(updated);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Table number already exists" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function listTables(_req: AuthRequest, res: Response) {
  const restaurantId = await getDefaultRestaurantId();

  const tables = await prisma.table.findMany({
    where: { restaurantId },
    orderBy: { tableNumber: "asc" },
  });

  res.json(tables);
}