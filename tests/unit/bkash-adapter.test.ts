import { describe, it, expect, vi } from "vitest";
import { BkashAdapter } from "@/lib/patterns/payment/bkash-adapter";

// Mock of the bKash client (the external network call).
function mockClient() {
  return {
    createPayment: vi.fn(),
    executePayment: vi.fn(),
  };
}

describe("BkashAdapter.charge", () => {
  it("maps a successful bKash payment to a SUCCESS result", async () => {
    const client = mockClient();
    client.createPayment.mockResolvedValue({ paymentID: "PAY1" });
    client.executePayment.mockResolvedValue({ transactionStatus: "Completed", trxID: "TRX1" });
    const adapter = new BkashAdapter(client);

    const result = await adapter.charge(50000, "ref-1");

    expect(client.createPayment).toHaveBeenCalledTimes(1);
    expect(client.createPayment).toHaveBeenCalledWith({
      amount: "500.00",
      merchantInvoiceNumber: "ref-1",
    });
    expect(client.executePayment).toHaveBeenCalledWith("PAY1");
    expect(result).toEqual({ status: "SUCCESS", reference: "TRX1" });
  });
});
