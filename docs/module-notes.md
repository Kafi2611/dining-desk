# Module Notes

One section per PR. Fill in after each PR is done.

## Template

- **PR / branch:**
- **What was built:**
- **Main files:**
- **Pattern (if any):**
- **Tests:**
- **What to say in the viva:**

## PR 1: chore/project-setup

- **PR / branch:** PR 1, `chore/project-setup`
- **What was built:** Next.js app, Prisma with `Hall` and `Settings`, Docker setup, Vitest, CI.
- **Main files:** `Dockerfile`, `docker-compose.yml`, `prisma/schema.prisma`, `prisma/seed.ts`, `vitest.config.mts`, `.github/workflows/ci.yml`
- **Pattern (if any):** none
- **Tests:** one placeholder test, so CI is green from day 1.
- **What to say in the viva:** Docker runs the database and the app. CI runs lint, tests and a Docker build on every PR.

## PR 2: feature/auth

- **PR / branch:** PR 2, `feature/auth` (FR1, FR2)
- **What was built:** `User` model, login with roll + password (bcrypt), `/login`, empty `/student` and `/manager` dashboards. Each role is sent away from the other role's pages. Seed has 1 manager + 4 students (demo password `demo1234`).
- **Main files:** `src/lib/services/auth-service.ts`, `src/lib/services/authorization.ts`, `src/auth.ts`, `src/lib/auth-guard.ts`, `src/app/login/`, `src/app/student/layout.tsx`, `src/app/manager/layout.tsx`, `prisma/seed.ts`
- **Pattern (if any):** none
- **Tests:** `tests/unit/auth-service.test.ts` (right password OK, wrong password refused) and `tests/unit/authorization.test.ts` (student blocked from manager action). Each rule has a `test:` commit before its `feat:` commit.
- **What to say in the viva:** Rules are in `AuthService` and `assertRole`, not in the page. The repository and the password checker are passed in, so tests use mocks. The role layouts call `assertRole` and redirect.

## PR 3: feature/wallet

- **PR / branch:** PR 3, `feature/wallet` (FR3, FR4 service part, FR5, FR12)
- **What was built:** `Wallet`, `Transaction`, `RechargeRequest`, `Notification` models. Every student gets a wallet in the seed (demo Tk 1000). `WalletService`: online recharge (min Tk 500), 1 offline request per day, approve / reject, transfer to the same hall with a password check. Student page with balance and 3 forms, and a bell in the layout. The manager screen for approve / reject comes later.
- **Main files:** `src/lib/services/wallet-service.ts`, `src/lib/patterns/payment/*`, `src/lib/patterns/events/*`, `src/lib/repositories/prisma-wallet-repository.ts`, `src/lib/container.ts`, `src/lib/actions/wallet.ts`, `src/app/student/`, `src/components/notification-bell.tsx`
- **Pattern (if any):** Adapter (`BkashAdapter` wraps the fake `BkashClient`; `OfflineGateway`; client is `WalletService`). Observer (`EventBus` is the subject; `InAppNotifier` and `SmsNotifier` are the observers).
- **Tests:** `bkash-adapter`, `offline-gateway`, `event-bus`, `in-app-notifier`, `sms-notifier`, `dhaka-time`, `wallet-recharge`, `wallet-offline`, `wallet-decision`, `wallet-transfer` in `tests/unit/`. 44 tests pass in total. Mocks: repository, gateway, hasher, event bus (`vi.fn()`), clock (`vi.setSystemTime`). Each rule has a `test:` commit before its `feat:` commit.
- **What to say in the viva:** `WalletService` only knows `PaymentGateway`, never bKash, so a new payment method is one new adapter class. Services only publish events, so a new channel is one new listener. A transfer runs in one `prisma.$transaction`; the test shows the debit is undone if the credit fails. The debit uses `balance >= amount` in the database, so the balance cannot go below 0.

## PR 4: feature/meal-tokens

- **PR / branch:** PR 4, `feature/meal-tokens` (FR6, FR7, FR8)
- **What was built:** `MealToken` model (added at the end of `schema.prisma`). Students buy tomorrow's Lunch / Dinner / Both token or a guest coupon on `/student/buy-token`. Rules: sale stops at the cutoff (23:00 Dhaka), date must be tomorrow, balance must cover the price, 1 regular token and 1 guest coupon per student per date, guest coupons max 10 per day per hall. The price is taken from the wallet in one database transaction. `LowBalance` is published when the balance falls below Tk 80.
- **Main files:** `src/lib/patterns/token-seller/*`, `src/lib/services/token-service.ts`, `src/lib/repositories/prisma-token-repository.ts`, `src/lib/actions/tokens.ts`, `src/app/student/buy-token/`
- **Pattern (if any):** Factory Method. Creator = `TokenSeller` (shared `sell()`, hook `checkExtraRules()`, abstract `createToken()`). ConcreteCreators = `RegularTokenSeller`, `GuestCouponSeller`. Product = `MealToken`. ConcreteProducts = `RegularToken`, `GuestCoupon`.
- **Tests:** `meal-token`, `token-seller`, `token-cutoff`, `token-date`, `token-balance`, `token-duplicate`, `guest-coupon-limit`, `token-service` in `tests/unit/`. Clock: `vi.setSystemTime` at 22:59 and 23:00 Dhaka. Mocks: repository, settings, event bus (`vi.fn()`). Each rule has a `test:` commit before its `feat:` commit.
- **What to say in the viva:** A new token type is 1 new seller + 1 new product class, no edits to old code (a test proves it). I rejected a `switch(type)` factory because every new type would edit the switch. `GuestCouponSeller` overrides only the hook for the hall limit. The debit and the saved token are in one transaction, so a failure undoes both.
