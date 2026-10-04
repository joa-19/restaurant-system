import { Request, Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { initiatePayment, verifyAndConfirm } from "./payments.service";

const initiateSchema = z.object({
  orderId: z.string().uuid(),
  phone: z.string().min(9),
  email: z.string().email().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function initiate(req: Request, res: Response) {
  const parsed = initiateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const { orderId, phone, email, firstName, lastName } = parsed.data;

  try {
    const result = await initiatePayment(orderId, { phone, email, firstName, lastName });
    res.json(result);
  } catch (err: any) {
    console.error("PAYMENT INITIATE ERROR:", err.response?.data || err.message);
    res.status(400).json({ error: err.response?.data?.message || err.message });
  }
}

export async function manualVerify(req: Request, res: Response) {
  const orderId = req.params.orderId as string;

  try {
    const payment = await prisma.payment.findUnique({ where: { orderId } });

    if (!payment || !payment.transactionReference) {
      return res.status(404).json({ error: "Payment not found for this order" });
    }

    const result = await verifyAndConfirm(payment.transactionReference);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

function isValidChapaSignature(req: Request): boolean {
  const secret = process.env.CHAPA_WEBHOOK_SECRET as string;
  const signature = req.headers["chapa-signature"] || req.headers["x-chapa-signature"];

  if (!signature) return false;

  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  return signature === expectedHash;
}

export async function webhookCallback(req: Request, res: Response) {
  // Only enforce signature check if a webhook secret is configured
  // (keeps local dev/testing from breaking before deployment sets one up)
  if (process.env.CHAPA_WEBHOOK_SECRET && !isValidChapaSignature(req)) {
    console.warn("Rejected webhook: invalid signature");
    return res.sendStatus(401);
  }

  const txRef = (req.query.trx_ref as string) || (req.body?.tx_ref as string);

  if (!txRef) {
    return res.status(400).json({ error: "Missing tx_ref" });
  }

  try {
    await verifyAndConfirm(txRef);
    res.sendStatus(200);
  } catch {
    res.sendStatus(200);
  }
}