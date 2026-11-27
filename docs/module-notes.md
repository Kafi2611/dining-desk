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

## PR 5: feature/transaction-history

- **PR / branch:** PR 5, `feature/transaction-history` (FR9)
- **What was built:** `HistoryService.list` filters wallet transactions by type, status and date range (Asia/Dhaka days). A wrong range (from after to) is refused. Newest first. Student page `/student/history` with 3 filters (type, status, from/to date). Schema: an index on `Transaction(walletId, createdAt)` and a `HistorySort` enum added at the END of `schema.prisma`.
- **Main files:** `src/lib/services/history-service.ts`, `src/lib/repositories/history-repository.ts`, `src/lib/repositories/prisma-history-repository.ts`, `src/lib/validators/history.ts`, `src/app/student/history/page.tsx`
- **Pattern (if any):** none
- **Tests:** `tests/unit/history-filter.test.ts` (type, status, Dhaka date range, only from / only to, wrong range, newest first). The `test:` commits come before the `feat:` commits.
- **What to say in the viva:** The service turns the dates into Dhaka day boundaries and passes a query to the repository, so tests use a mock. The page only reads the filters, validates them with Zod and calls the service. The schema change at the end of the file is the one that conflicts with PR 4.
