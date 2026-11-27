// Wires the real parts together (database, bKash adapter, listeners). Tests do not use this file.
import bcrypt from "bcryptjs";
import { EventBus } from "@/lib/patterns/events/event-bus";
import { InAppNotifier } from "@/lib/patterns/events/in-app-notifier";
import { SmsNotifier } from "@/lib/patterns/events/sms-notifier";
import { BkashAdapter } from "@/lib/patterns/payment/bkash-adapter";
import { BkashClient } from "@/lib/patterns/payment/bkash-client";
import { OfflineGateway } from "@/lib/patterns/payment/offline-gateway";
import { GuestCouponSeller } from "@/lib/patterns/token-seller/guest-coupon-seller";
import { RegularTokenSeller } from "@/lib/patterns/token-seller/regular-token-seller";
import { PrismaHistoryRepository } from "@/lib/repositories/prisma-history-repository";
import { PrismaMealCountRepository } from "@/lib/repositories/prisma-meal-count-repository";
import { PrismaNotificationRepository } from "@/lib/repositories/prisma-notification-repository";
import { PrismaPendingRequestRepository } from "@/lib/repositories/prisma-pending-request-repository";
import { PrismaSettingsRepository } from "@/lib/repositories/prisma-settings-repository";
import { PrismaTokenRepository } from "@/lib/repositories/prisma-token-repository";
import { PrismaUserRepository } from "@/lib/repositories/prisma-user-repository";
import { PrismaWalletRepository } from "@/lib/repositories/prisma-wallet-repository";
import { HistoryService } from "@/lib/services/history-service";
import { ManagerService } from "@/lib/services/manager-service";
import { TokenService } from "@/lib/services/token-service";
import { WalletService } from "@/lib/services/wallet-service";

export const notificationRepository = new PrismaNotificationRepository();
export const walletRepository = new PrismaWalletRepository();
export const historyService = new HistoryService(new PrismaHistoryRepository());

const eventBus = new EventBus();
const inApp = new InAppNotifier(notificationRepository);
const sms = new SmsNotifier();
for (const type of ["RechargeApproved", "RechargeRejected", "MoneyReceived", "LowBalance"] as const) {
  eventBus.subscribe(type, inApp);
  eventBus.subscribe(type, sms);
}

const users = new PrismaUserRepository();
export const settings = new PrismaSettingsRepository();

export const walletService = new WalletService({
  wallets: walletRepository,
  users,
  settings,
  hasher: { compare: (plain, hash) => bcrypt.compare(plain, hash) },
  onlineGateway: new BkashAdapter(new BkashClient()),
  offlineGateway: new OfflineGateway(),
  events: eventBus,
});

export const managerService = new ManagerService({
  counts: new PrismaMealCountRepository(),
  settings,
});
export const pendingRequests = new PrismaPendingRequestRepository();

const tokenRepository = new PrismaTokenRepository();
const sellerDeps = { tokens: tokenRepository, users, settings };

export const tokenService = new TokenService({
  regularSeller: new RegularTokenSeller(sellerDeps),
  guestSeller: new GuestCouponSeller(sellerDeps),
  settings,
  events: eventBus,
});
