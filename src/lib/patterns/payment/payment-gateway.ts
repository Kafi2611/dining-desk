// Pattern: Adapter (structural).
// GoF role: PaymentGateway is the Target, the interface WalletService (the Client) talks to.

export type PaymentStatus = "SUCCESS" | "FAILED" | "TIMEOUT" | "PENDING";

export interface PaymentResult {
  status: PaymentStatus;
  reference?: string;
  message?: string;
}

export interface PaymentGateway {
  // amount is in poisha. ref is our own reference for this payment.
  charge(amount: number, ref: string): Promise<PaymentResult>;
}
