import axios from "axios";
import {
  PaymentProvider,
  InitializePaymentInput,
  InitializePaymentResult,
  VerifyPaymentResult,
} from "./payment-provider.interface";

const CHAPA_BASE_URL = process.env.CHAPA_BASE_URL as string;
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY as string;

const chapaClient = axios.create({
  baseURL: CHAPA_BASE_URL,
  headers: {
    Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

export class ChapaAdapter implements PaymentProvider {
  async initialize(input: InitializePaymentInput): Promise<InitializePaymentResult> {
    const response = await chapaClient.post("/transaction/initialize", {
      amount: input.amount,
      currency: input.currency,
      email: input.email,
      first_name: input.firstName,
      last_name: input.lastName,
      phone_number: input.phone,
      tx_ref: input.txRef,
      return_url: input.returnUrl,
      callback_url: input.callbackUrl,
    });

    if (response.data.status !== "success") {
      throw new Error("Chapa initialization failed");
    }

    return { checkoutUrl: response.data.data.checkout_url };
  }

  async verify(txRef: string): Promise<VerifyPaymentResult> {
    const response = await chapaClient.get(`/transaction/verify/${txRef}`);
    const data = response.data.data;

    return {
      status: data.status === "success" ? "success" : "failed",
      amount: Number(data.amount),
      currency: data.currency,
      txRef: data.tx_ref,
    };
  }
}