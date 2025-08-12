/*
  Warnings:

  - Added the required column `dueDate` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL;
