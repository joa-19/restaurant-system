import { Request, Response } from "express";
import { z } from "zod";
import { login } from "./auth.service";

const loginSchema = z.object({
  phone: z.string().min(5),
  password: z.string().min(1),
});

export async function loginHandler(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid phone or password format" });
  }

  const { phone, password } = parsed.data;

  try {
    const result = await login(phone, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: "Invalid credentials" });
  }
}