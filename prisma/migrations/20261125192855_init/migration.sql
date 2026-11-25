-- CreateTable
CREATE TABLE "Hall" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Hall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "mealRate" INTEGER NOT NULL DEFAULT 4000,
    "guestRate" INTEGER NOT NULL DEFAULT 5000,
    "cutoffTime" TEXT NOT NULL DEFAULT '23:00',
    "guestDailyLimit" INTEGER NOT NULL DEFAULT 10,
    "minRecharge" INTEGER NOT NULL DEFAULT 50000,
    "lowBalanceAt" INTEGER NOT NULL DEFAULT 8000,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Hall_name_key" ON "Hall"("name");
