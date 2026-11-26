import type { EventBus } from "@/lib/patterns/events/event-bus";
import type { DiningEvent } from "@/lib/patterns/events/events";
import type { PaymentGateway } from "@/lib/patterns/payment/payment-gateway";
import type { SettingsRepository } from "@/lib/repositories/settings-repository";
import type { UserLookup } from "@/lib/repositories/user-repository";
import type { WalletRepository, WalletStore } from "@/lib/repositories/wallet-repository";
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

  // The caller (server action) has already checked that managerId is a MANAGER.
  async approveOffline(managerId: number, requestId: number): Promise<void> {
    const request = await this.deps.wallets.transaction(async (tx) => {
      const req = await this.findPending(tx, requestId);
      const wallet = await tx.getWalletByUserId(req.userId);
      if (!wallet) throw new WalletError("NO_WALLET", "Wallet not found");
      const balanceAfter = await tx.credit(wallet.id, req.amount);
      await tx.addTransaction({
        walletId: wallet.id,
        type: "RECHARGE",
        method: "OFFLINE",
        amount: req.amount,
        status: "COMPLETED",
        balanceAfter,
        note: req.reference,
      });
      await tx.decideRechargeRequest(requestId, "APPROVED", managerId, new Date());
      return req;
    });
    await this.notify({
      type: "RechargeApproved",
      userId: request.userId,
      amount: request.amount,
    });
  }

  async rejectOffline(managerId: number, requestId: number): Promise<void> {
    const request = await this.deps.wallets.transaction(async (tx) => {
      const req = await this.findPending(tx, requestId);
      const wallet = await tx.getWalletByUserId(req.userId);
      if (!wallet) throw new WalletError("NO_WALLET", "Wallet not found");
      await tx.addTransaction({
        walletId: wallet.id,
        type: "RECHARGE",
        method: "OFFLINE",
        amount: req.amount,
        status: "REJECTED",
        balanceAfter: wallet.balance,
        note: req.reference,
      });
      await tx.decideRechargeRequest(requestId, "REJECTED", managerId, new Date());
      return req;
    });
    await this.notify({
      type: "RechargeRejected",
      userId: request.userId,
      amount: request.amount,
    });
  }

  // FR5: send money to a student of the same hall. Debit + credit + records are all-or-nothing.
  async transfer(
    senderId: number,
    recipientRoll: string,
    amount: number,
    password: string,
  ): Promise<void> {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new WalletError("INVALID_AMOUNT", "Amount must be a positive whole number of poisha");
    }
    const sender = await this.deps.users.findById(senderId);
    if (!sender) throw new WalletError("NO_WALLET", "Sender not found");
    const recipient = await this.deps.users.findByRoll(recipientRoll);
    if (!recipient || recipient.role !== "STUDENT") {
      throw new WalletError("RECIPIENT_NOT_FOUND", "No student with this roll");
    }
    if (recipient.id === sender.id) {
      throw new WalletError("SELF_TRANSFER", "You cannot send money to yourself");
    }
    if (!(await this.deps.hasher.compare(password, sender.passwordHash))) {
      throw new WalletError("WRONG_PASSWORD", "Wrong password");
    }
    if (recipient.hallId !== sender.hallId) {
      throw new WalletError("DIFFERENT_HALL", "You can send money only to a student of your hall");
    }

    await this.deps.wallets.transaction(async (tx) => {
      const from = (await tx.getWalletByUserId(sender.id))!;
      const to = (await tx.getWalletByUserId(recipient.id))!;
      if (from.balance < amount) {
        throw new WalletError("INSUFFICIENT_BALANCE", "Not enough balance");
      }
      const fromAfter = await tx.debit(from.id, amount);
      const toAfter = await tx.credit(to.id, amount);
      await tx.addTransaction({
        walletId: from.id,
        type: "TRANSFER_OUT",
        method: "WALLET",
        amount,
        status: "COMPLETED",
        balanceAfter: fromAfter,
        note: `To ${recipient.roll}`,
      });
      await tx.addTransaction({
        walletId: to.id,
        type: "TRANSFER_IN",
        method: "WALLET",
        amount,
        status: "COMPLETED",
        balanceAfter: toAfter,
        note: `From ${sender.roll}`,
      });
    });

    await this.notify({
      type: "MoneyReceived",
      userId: recipient.id,
      amount,
      fromName: sender.name,
    });
  }

  // Events are sent after the money has moved. A broken notification must never undo or hide that.
  private async notify(event: DiningEvent): Promise<void> {
    try {
      await this.deps.events.publish(event);
    } catch (e) {
      console.error("Could not publish event:", e);
    }
  }

  private async findPending(tx: WalletStore, requestId: number) {
    const req = await tx.findRechargeRequest(requestId);
    if (!req) throw new WalletError("REQUEST_NOT_FOUND", "Recharge request not found");
    if (req.status !== "PENDING") {
      throw new WalletError("REQUEST_NOT_PENDING", "This request was already decided");
    }
    return req;
  }
}
