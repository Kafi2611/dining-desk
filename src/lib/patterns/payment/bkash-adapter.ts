// Pattern: Adapter (structural).
// GoF role: BkashAdapter is the Adapter. It turns charge() into bKash's 2 steps (createPayment, executePayment).
import type { BkashClient } from "@/lib/patterns/payment/bkash-client";
import type { PaymentGateway, PaymentResult } from "@/lib/patterns/payment/payment-gateway";

export class BkashAdapter implements PaymentGateway {
  constructor(private readonly client: Pick<BkashClient, "createPayment" | "executePayment">) {}

  async charge(amount: number, ref: string): Promise<PaymentResult> {
    const taka = (amount / 100).toFixed(2);
    const created = await this.client.createPayment({
      amount: taka,
      merchantInvoiceNumber: ref,
    });
    const executed = await this.client.executePayment(created.paymentID);
    return { status: "SUCCESS", reference: executed.trxID };
  }
}
