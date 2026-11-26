import type { EventBus } from "@/lib/patterns/events/event-bus";
import type { PaymentGateway } from "@/lib/patterns/payment/payment-gateway";
import type { SettingsRepository } from "@/lib/repositories/settings-repository";
import type { UserLookup } from "@/lib/repositories/user-repository";
import type { WalletRepository } from "@/lib/repositories/wallet-repository";
import type { PasswordHasher } from "@/lib/services/auth-service";
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
  }
}
