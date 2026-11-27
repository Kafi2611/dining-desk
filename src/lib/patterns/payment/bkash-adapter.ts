// Pattern: Adapter (structural).
// GoF role: BkashAdapter is the Adapter. It turns charge() into bKash's 2 steps (createPayment, executePayment).
import { BkashTimeoutError, type BkashClient } from "@/lib/patterns/payment/bkash-client";
import type { PaymentGateway, PaymentResult } from "@/lib/patterns/payment/payment-gateway";

export class BkashAdapter implements PaymentGateway {
  constructor(private readonly client: Pick<BkashClient, "createPayment" | "executePayment">) {}

  async charge(amount: number, ref: string): Promise<PaymentResult> {
    try {
      const taka = (amount / 100).toFixed(2);
      const created = await this.client.createPayment({
        amount: taka,
        merchantInvoiceNumber: ref,
      });
      const executed = await this.client.executePayment(created.paymentID);
      if (executed.transactionStatus !== "Completed") {
        return { status: "FAILED", message: "bKash did not complete the payment" };
      }
      return { status: "SUCCESS", reference: executed.trxID };
    } catch (e) {
      if (e instanceof BkashTimeoutError) {
        return { status: "TIMEOUT", message: e.message };
      }
      return { status: "FAILED", message: e instanceof Error ? e.message : "bKash error" };
    }
  }
}
