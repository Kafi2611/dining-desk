-- CreateEnum
CREATE TYPE "HistorySort" AS ENUM ('NEWEST', 'OLDEST');

-- CreateIndex
CREATE INDEX "Transaction_walletId_createdAt_idx" ON "Transaction"("walletId", "createdAt");
