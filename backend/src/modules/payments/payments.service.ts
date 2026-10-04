import { getIO } from "../../socket";
import { prisma } from "../../config/prisma";
import { ChapaAdapter } from "./providers/chapa.adapter";
import { PaymentMethod, PaymentStatus, OrderStatus } from "@prisma/client";

const paymentProvider = new ChapaAdapter();

export async function initiatePayment(
  orderId: string,
  customer: { phone: string; email?: string; firstName: string; lastName: string }
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) throw new Error("Order not found");
  if (order.status !== "PENDING_PAYMENT") throw new Error("Order is not payable");

  const txRef = `ord-${order.orderNumber}-${Date.now()}`;


  // Use the real email if given, otherwise a placeholder built from the phone.
  const email = customer.email?.trim() || `${customer.phone.trim()}@gmail.com`;

  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: { transactionReference: txRef, status: PaymentStatus.PENDING },
    create: {
      orderId: order.id,
      provider: "chapa",
      paymentMethod: PaymentMethod.ONLINE,
      transactionReference: txRef,
      amount: order.total,
      currency: "ETB",
      status: PaymentStatus.PENDING,
    },
  });

  const result = await paymentProvider.initialize({
    amount: Number(order.total),
    currency: "ETB",
    email,
    firstName: customer.firstName,
    lastName: customer.lastName,
    phone: customer.phone,
    txRef,
    returnUrl: `${process.env.FRONTEND_URL}/order/${order.id}`,
    callbackUrl: `${process.env.BACKEND_URL}/payments/callback`,
  });

  return result;
}

// Shared by both the webhook AND the manual verify-on-return call.
// Must be idempotent — safe to call multiple times for the same txRef.
export async function verifyAndConfirm(txRef: string) {
  const payment = await prisma.payment.findUnique({
    where: { transactionReference: txRef },
    include: { order: true },
  });

  if (!payment) throw new Error("Payment not found");

  if (payment.status === PaymentStatus.PAID) {
    return { alreadyProcessed: true, order: payment.order };
  }

  const verification = await paymentProvider.verify(txRef);

  if (
    verification.status === "success" &&
    Number(verification.amount) === Number(payment.amount)
  ) {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.PAID, verifiedAt: new Date() },
      });

      return tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.CONFIRMED },
      });
    });
     getIO().emit("orders_updated");
    return { alreadyProcessed: false, order: updatedOrder };
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.FAILED },
  });

  return { alreadyProcessed: false, order: payment.order, failed: true };
}