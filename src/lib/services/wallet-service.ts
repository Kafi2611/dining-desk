import type { EventBus } from "@/lib/patterns/events/event-bus";
import type { PaymentGateway } from "@/lib/patterns/payment/payment-gateway";
import type { SettingsRepository } from "@/lib/repositories/settings-repository";
import type { UserLookup } from "@/lib/repositories/user-repository";
import type { WalletRepository } from "@/lib/repositories/wallet-repository";
import type { PasswordHasher } from "@/lib/services/auth-service";
import { dhakaDayRange } from "@/lib/services/dhaka-time";
import { WalletError } from "@/lib/services/wallet-errors";

export interface WalletServiceDeps {
  wallets: WalletRepository;
  users: UserLookup;
  settings: SettingsRepository;
  hasher: PasswordHasher;
  onlineGateway: PaymentGateway; // BkashAdapter in the app
  offlineGateway: PaymentGateway; // OfflineGateway in the app
  events: Pick<EventBus, "publish">;
}

// All wallet rules live here. Amounts are whole poisha (Tk 40 = 4000).
export class WalletService {
  constructor(private readonly deps: WalletServiceDeps) {}

  async rechargeOnline(userId: number, amount: number): Promise<void> {
    const settings = await this.deps.settings.get();
    if (amount < settings.minRecharge) {
      throw new WalletError("BELOW_MINIMUM", "The minimum recharge is Tk 500");
    }

    // The network call to bKash happens outside the database transaction.
    const result = await this.deps.onlineGateway.charge(amount, `recharge-${userId}-${Date.now()}`);
    const paid = result.status === "SUCCESS";

    await this.deps.wallets.transaction(async (tx) => {
      const wallet = await tx.getWalletByUserId(userId);
      if (!wallet) throw new WalletError("NO_WALLET", "Wallet not found");
      const balanceAfter = paid ? await tx.credit(wallet.id, amount) : wallet.balance;
      await tx.addTransaction({
        walletId: wallet.id,
        type: "RECHARGE",
        method: "BKASH",
        amount,
        status: paid ? "COMPLETED" : "FAILED",
        balanceAfter,
        note: result.reference ?? result.message,
      });
    });

    if (!paid) {
      throw new WalletError("PAYMENT_FAILED", "bKash payment failed. No money was taken");
    }
  }

  // FR4: 1 offline request per student per Dhaka day. The manager decides later.
  async requestOffline(userId: number, amount: number, reference: string): Promise<void> {
    const { start, end } = dhakaDayRange(new Date());
    await this.deps.wallets.transaction(async (tx) => {
      const already = await tx.countRechargeRequests(userId, "OFFLINE", start, end);
      if (already >= 1) {
        throw new WalletError(
          "ALREADY_REQUESTED_TODAY",
          "You can send only 1 offline recharge request per day",
        );
      }
      const result = await this.deps.offlineGateway.charge(amount, reference);
      await tx.createRechargeRequest({
        userId,
        amount,
        method: "OFFLINE",
        reference: result.reference ?? reference,
      });
    });
  }
}
