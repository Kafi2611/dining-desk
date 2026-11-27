import { describe, it, expect } from "vitest";
import { OfflineGateway } from "@/lib/patterns/payment/offline-gateway";

describe("OfflineGateway.charge", () => {
  it("returns PENDING, because the manager must approve the cash payment", async () => {
    const gateway = new OfflineGateway();

    const result = await gateway.charge(50000, "slip-77");

    expect(result).toEqual({ status: "PENDING", reference: "slip-77" });
  });
});
