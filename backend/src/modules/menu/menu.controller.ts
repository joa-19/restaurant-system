import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

async function getDefaultRestaurantId() {
  const restaurant = await prisma.restaurant.findFirst();
  if (!restaurant) throw new Error("No restaurant found. Did you seed the DB?");
  return restaurant.id;
}

export async function createCategory(req: AuthRequest, res: Response) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const restaurantId = await getDefaultRestaurantId();

  const category = await prisma.category.create({
    data: { restaurantId, name },
  });

  res.status(201).json(category);
}

export async function listCategories(_req: AuthRequest, res: Response) {
  const restaurantId = await getDefaultRestaurantId();

  const categories = await prisma.category.findMany({
    where: { restaurantId },
    include: { menuItems: true },
  });

  res.json(categories);
}

export async function createMenuItem(req: AuthRequest, res: Response) {
  const { categoryId, name, description, price, image } = req.body;

  if (!categoryId || !name || price === undefined) {
    return res.status(400).json({ error: "categoryId, name, and price are required" });
  }

  const item = await prisma.menuItem.create({
    data: { categoryId, name, description, price, image },
  });

  res.status(201).json(item);
}

export async function updateMenuItem(req: AuthRequest, res: Response) {
  const id = req.params.id as string;
  const { name, description, price, image, available } = req.body;

  try {
    const item = await prisma.menuItem.update({
      where: { id },
      data: { name, description, price, image, available },
    });
    res.json(item);
  } catch {
    res.status(404).json({ error: "Menu item not found" });
  }
}

export async function deleteMenuItem(req: AuthRequest, res: Response) {
  const id = req.params.id as string;

  try {
    await prisma.menuItem.delete({ where: { id } });
    res.json({ message: "Deleted" });
  } catch {
    res.status(404).json({ error: "Menu item not found" });
  }
}