import { describe, it, expect } from "vitest";
import { WalletService } from "@/lib/services/wallet-service";
import { makeWalletWorld } from "./helpers/wallet-world";

function setup() {
  const world = makeWalletWorld();
  const service = new WalletService({
    wallets: world.wallets,
    users: world.users,
    settings: world.settings,
    hasher: world.hasher,
    onlineGateway: world.onlineGateway,
    offlineGateway: world.offlineGateway,
    events: world.events,
  });
  return { world, service };
}

describe("WalletService.rechargeOnline", () => {
  it("refuses Tk 499 (below the minimum of Tk 500) and never calls bKash", async () => {
    const { world, service } = setup();

    await expect(service.rechargeOnline(1, 49900)).rejects.toMatchObject({
      code: "BELOW_MINIMUM",
    });

    expect(world.onlineGateway.charge).not.toHaveBeenCalled();
    expect(world.balanceOf(1)).toBe(100000);
  });
});
