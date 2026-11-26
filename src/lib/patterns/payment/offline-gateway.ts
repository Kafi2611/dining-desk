// Pattern: Adapter (structural).
// GoF role: OfflineGateway is a second implementation of the Target (PaymentGateway). Nothing is charged now.
import type { PaymentGateway, PaymentResult } from "@/lib/patterns/payment/payment-gateway";

export class OfflineGateway implements PaymentGateway {
  async charge(_amount: number, ref: string): Promise<PaymentResult> {
    return { status: "PENDING", reference: ref };
  }
}
