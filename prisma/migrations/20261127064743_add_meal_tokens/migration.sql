-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('LUNCH', 'DINNER', 'BOTH');

-- CreateEnum
CREATE TYPE "TokenKind" AS ENUM ('REGULAR', 'GUEST');

-- CreateTable
CREATE TABLE "MealToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "mealType" "MealType" NOT NULL,
    "kind" "TokenKind" NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MealToken_userId_date_kind_key" ON "MealToken"("userId", "date", "kind");

-- AddForeignKey
ALTER TABLE "MealToken" ADD CONSTRAINT "MealToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
