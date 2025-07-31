/*
  Warnings:

  - The values [INCOMING,OUTGOING,INVESTMENT] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('income', 'expense', 'investment');
ALTER TABLE "transactions" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "transactions" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
ALTER TABLE "transactions" ALTER COLUMN "type" SET DEFAULT 'expense';
COMMIT;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "type" SET DEFAULT 'expense';
