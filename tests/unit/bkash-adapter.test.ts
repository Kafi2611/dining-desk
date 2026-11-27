import { describe, it, expect, vi } from "vitest";
import { BkashAdapter } from "@/lib/patterns/payment/bkash-adapter";
import { BkashTimeoutError } from "@/lib/patterns/payment/bkash-client";

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

  it("maps a failed bKash payment to a FAILED result", async () => {
    const client = mockClient();
    client.createPayment.mockResolvedValue({ paymentID: "PAY2" });
    client.executePayment.mockResolvedValue({ transactionStatus: "Failed" });
    const adapter = new BkashAdapter(client);

    const result = await adapter.charge(50000, "ref-2");

    expect(result.status).toBe("FAILED");
  });

  it("maps a bKash timeout to a TIMEOUT result", async () => {
    const client = mockClient();
    client.createPayment.mockRejectedValue(new BkashTimeoutError());
    const adapter = new BkashAdapter(client);

    const result = await adapter.charge(50000, "ref-3");

    expect(result.status).toBe("TIMEOUT");
    expect(client.executePayment).not.toHaveBeenCalled();
  });

  it("maps any other bKash error to a FAILED result", async () => {
    const client = mockClient();
    client.createPayment.mockRejectedValue(new Error("network down"));
    const adapter = new BkashAdapter(client);

    const result = await adapter.charge(50000, "ref-4");

    expect(result).toEqual({ status: "FAILED", message: "network down" });
  });
});
