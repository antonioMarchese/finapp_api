-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "type" "TransactionType" NOT NULL DEFAULT 'expense',
ADD COLUMN     "weeklyBudget" DOUBLE PRECISION;

-- Keep the current listing order for existing categories.
UPDATE "categories" SET "position" = "id";

-- Categories only ever used for one non-expense type take that type.
UPDATE "categories" c SET "type" = t."type"
FROM (
    SELECT "categoryId", MIN("type"::text)::"TransactionType" AS "type"
    FROM "transactions"
    GROUP BY "categoryId"
    HAVING COUNT(DISTINCT "type") = 1
) t
WHERE t."categoryId" = c."id";

-- CreateTable
CREATE TABLE "weekly_goals" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "currency" "Currency" NOT NULL DEFAULT 'BRL',
    "spendingLimit" DOUBLE PRECISION,
    "showDailyBudget" BOOLEAN NOT NULL DEFAULT true,
    "savingsTarget" DOUBLE PRECISION,
    "noSpendDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_goals_pkey" PRIMARY KEY ("id")
);
