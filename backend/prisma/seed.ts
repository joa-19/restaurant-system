import { PrismaClient, Role, OrderSource } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1. Restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      name: "Demo Restaurant",
      contact: "0900000000",
    },
  });

  // 2. Tables
  const table12 = await prisma.table.create({
    data: {
      restaurantId: restaurant.id,
      tableNumber: 12,
      qrCode: `restaurant.com/menu?table=12`,
    },
  });

  await prisma.table.create({
    data: {
      restaurantId: restaurant.id,
      tableNumber: 5,
      qrCode: `restaurant.com/menu?table=5`,
    },
  });

  // 3. Category + Menu Items
  const mains = await prisma.category.create({
    data: { restaurantId: restaurant.id, name: "Mains" },
  });

  const drinks = await prisma.category.create({
    data: { restaurantId: restaurant.id, name: "Drinks" },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        categoryId: mains.id,
        name: "Chicken Burger",
        description: "Grilled chicken, lettuce, special sauce",
        price: 350,
      },
      {
        categoryId: mains.id,
        name: "Fries",
        description: "Crispy golden fries",
        price: 150,
      },
      {
        categoryId: drinks.id,
        name: "Coke",
        description: "330ml can",
        price: 80,
      },
    ],
  });

  // 4. Manager user
  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.create({
    data: {
      name: "Demo Manager",
      phone: "0911111111",
      passwordHash,
      role: Role.MANAGER,
      active: true,
    },
  });

  console.log("✅ Seed complete!");
  console.log(`Table 12 QR path: /menu?table=${table12.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });