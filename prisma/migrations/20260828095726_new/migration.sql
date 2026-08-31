/*
  Warnings:

  - The `subscription_status` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "subscription_status",
ADD COLUMN     "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE';
