export interface InitializePaymentInput {
  amount: number;
  currency: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  txRef: string;
  returnUrl: string;
  callbackUrl: string;
}

export interface InitializePaymentResult {
  checkoutUrl: string;
}

export interface VerifyPaymentResult {
  status: "success" | "failed" | "pending";
  amount: number;
  currency: string;
  txRef: string;
}

export interface PaymentProvider {
  initialize(input: InitializePaymentInput): Promise<InitializePaymentResult>;
  verify(txRef: string): Promise<VerifyPaymentResult>;
}