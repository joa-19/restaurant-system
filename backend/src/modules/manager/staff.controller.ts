import { Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";

const VALID_ROLES = ["MANAGER", "CASHIER", "CHEF", "WAITER"];

export async function createStaff(req: AuthRequest, res: Response) {
  const { name, phone, password, role } = req.body;

  if (!name || !phone || !password || !role) {
    return res.status(400).json({ error: "name, phone, password, role are required" });
  }

  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: { name, phone, passwordHash, role, active: true },
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      active: user.active,
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Phone number already in use" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function listStaff(_req: AuthRequest, res: Response) {
  const staff = await prisma.user.findMany({
    select: { id: true, name: true, phone: true, role: true, active: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(staff);
}

export async function toggleActive(req: AuthRequest, res: Response) {
  const id = req.params.id as string;
  const { active } = req.body as { active: boolean };

  const user = await prisma.user.update({ where: { id }, data: { active } });
  res.json({ id: user.id, active: user.active });
}

export async function resetPassword(req: AuthRequest, res: Response) {
  const id = req.params.id as string;
  const { newPassword } = req.body as { newPassword: string };

  if (!newPassword) {
    return res.status(400).json({ error: "newPassword is required" });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });

  res.json({ message: "Password reset" });
}