/*
  Warnings:

  - A unique constraint covering the columns `[companyId]` on the table `SiteSetting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "IndustryCategory" AS ENUM ('FASHION_ATELIER', 'FASHION_BOUTIQUE', 'FITNESS_GYM', 'EDITORIAL_BLOG', 'FOOD_BEVERAGE', 'GENERAL_RETAIL');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'TRIAL_EXPIRED', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');

-- CreateEnum
CREATE TYPE "MemberStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('SUPERADMIN', 'PLATFORM_ADMIN');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('CUSTOMER_DISPUTE', 'MERCHANT_SUPPORT');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('UNFULFILLED_ORDER', 'DEFECTIVE_PRODUCT', 'FRAUD_SUSPICION', 'PAYMENT_ISSUE', 'UI_BUG', 'FEATURE_REQUEST', 'GENERAL_FEEDBACK', 'OTHER');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'INVESTIGATING', 'RESOLVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderSettlementStatus" AS ENUM ('PENDING_24H', 'SETTLED', 'HELD_DISPUTED', 'REFUNDED');

-- AlterEnum
ALTER TYPE "PlanType" ADD VALUE 'FREE_TRIAL';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SubscriptionStatus" ADD VALUE 'PAST_DUE';
ALTER TYPE "SubscriptionStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'SUPERADMIN';
ALTER TYPE "UserRole" ADD VALUE 'MANAGER';

-- DropIndex
DROP INDEX "AnalyticsMetrics_date_key";

-- DropIndex
DROP INDEX "Image_group_createdAt_idx";

-- AlterTable
ALTER TABLE "AnalyticsMetrics" ADD COLUMN     "companyId" TEXT;

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "additionalUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isPlatformAsset" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "itemGroupId" TEXT,
ADD COLUMN     "priceKobo" INTEGER DEFAULT 3500000,
ALTER COLUMN "category" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "bodyFont" TEXT NOT NULL DEFAULT 'Jost',
ADD COLUMN     "brandFont" TEXT NOT NULL DEFAULT 'Bodoni Moda',
ADD COLUMN     "city" TEXT DEFAULT 'Lagos',
ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'Nigeria',
ADD COLUMN     "headingFont" TEXT NOT NULL DEFAULT 'Cormorant Garamond',
ADD COLUMN     "layoutMode" TEXT NOT NULL DEFAULT 'GRID_2X2',
ADD COLUMN     "openingHours" TEXT DEFAULT 'Mo-Sa 09:00-18:00',
ADD COLUMN     "physicalAddress" TEXT,
ADD COLUMN     "state" TEXT DEFAULT 'Lagos State',
ADD COLUMN     "themeColor" TEXT NOT NULL DEFAULT '#C9A96E';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "lastTrafficReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "monthlyVisits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "platformRole" "PlatformRole",
ADD COLUMN     "termsAgreed" BOOLEAN DEFAULT false,
ADD COLUMN     "trafficLimit" INTEGER DEFAULT 2000,
ADD COLUMN     "trafficNotified100" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trafficNotified80" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "companyName" DROP NOT NULL,
ALTER COLUMN "planSelected" SET DEFAULT 'FREE_TRIAL';

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "industry" "IndustryCategory" NOT NULL DEFAULT 'FASHION_ATELIER',
    "brandVibe" TEXT NOT NULL DEFAULT 'ROYAL_LUXURY',
    "version" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "allowedBlocks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplatePage" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "sections" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplatePage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "industry" "IndustryCategory" NOT NULL DEFAULT 'FASHION_ATELIER',
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "planSelected" "PlanType" NOT NULL DEFAULT 'FREE_TRIAL',
    "subscription_status" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "subscription_id" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "activeTemplateId" TEXT,
    "brandBio" TEXT,
    "brandTone" TEXT,
    "aiCreditsRemaining" INTEGER NOT NULL DEFAULT 10,
    "trafficLimit" INTEGER NOT NULL DEFAULT 2000,
    "monthlyVisits" INTEGER NOT NULL DEFAULT 0,
    "trafficNotified80" BOOLEAN NOT NULL DEFAULT false,
    "trafficNotified100" BOOLEAN NOT NULL DEFAULT false,
    "lastTrafficReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storageLimit" INTEGER NOT NULL DEFAULT 100,
    "storageUsed" INTEGER NOT NULL DEFAULT 0,
    "paystackSubaccountCode" TEXT,
    "bankInfo" JSONB,
    "pendingBalanceKobo" INTEGER NOT NULL DEFAULT 0,
    "settledBalanceKobo" INTEGER NOT NULL DEFAULT 0,
    "disputedBalanceKobo" INTEGER NOT NULL DEFAULT 0,
    "todaySalesKobo" INTEGER NOT NULL DEFAULT 0,
    "lastSalesDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyMember" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MANAGER',
    "status" "MemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StorePage" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "sections" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StorePage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "companyId" TEXT,
    "inviterId" TEXT,
    "role" "MemberRole" NOT NULL DEFAULT 'MANAGER',
    "adminId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionTransaction" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "planSelected" "PlanType" NOT NULL,
    "customStorageMB" INTEGER,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "paystackAccessCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "orderType" TEXT NOT NULL DEFAULT 'CATALOG',
    "amountKobo" INTEGER NOT NULL,
    "originalAmountKobo" INTEGER,
    "discountKobo" INTEGER DEFAULT 0,
    "shippingKobo" INTEGER NOT NULL DEFAULT 0,
    "platformFeeKobo" INTEGER NOT NULL DEFAULT 0,
    "merchantNetKobo" INTEGER NOT NULL DEFAULT 0,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "settlementStatus" "OrderSettlementStatus" NOT NULL DEFAULT 'PENDING_24H',
    "settledAt" TIMESTAMP(3),
    "customerEmail" TEXT NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "items" JSONB NOT NULL,
    "notes" TEXT,
    "paystackAccessCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priceKobo" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT NOT NULL,
    "attributes" JSONB,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppealRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "contactInfo" TEXT,
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppealRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomPlanQuote" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "userId" TEXT,
    "plan" "PlanType" NOT NULL DEFAULT 'ENTERPRISE',
    "authorizedAmountKobo" INTEGER NOT NULL,
    "authorizedStorageMB" INTEGER NOT NULL,
    "authorizedTrafficLimit" INTEGER,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomPlanQuote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "platformFeePercent" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformTicket" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "type" "TicketType" NOT NULL DEFAULT 'CUSTOMER_DISPUTE',
    "category" "TicketCategory" NOT NULL DEFAULT 'UNFULFILLED_ORDER',
    "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
    "companyId" TEXT,
    "orderId" TEXT,
    "orderReference" TEXT,
    "submitterEmail" TEXT NOT NULL,
    "submitterName" TEXT,
    "submitterPhone" TEXT,
    "role" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "adminNotes" TEXT,
    "resolvedBy" TEXT,
    "refundStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Template_slug_key" ON "Template"("slug");

-- CreateIndex
CREATE INDEX "Template_industry_isActive_idx" ON "Template"("industry", "isActive");

-- CreateIndex
CREATE INDEX "TemplatePage_templateId_idx" ON "TemplatePage"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplatePage_templateId_slug_key" ON "TemplatePage"("templateId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_slug_idx" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_industry_status_idx" ON "Company"("industry", "status");

-- CreateIndex
CREATE INDEX "CompanyMember_companyId_status_idx" ON "CompanyMember"("companyId", "status");

-- CreateIndex
CREATE INDEX "CompanyMember_userId_idx" ON "CompanyMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyMember_companyId_userId_key" ON "CompanyMember"("companyId", "userId");

-- CreateIndex
CREATE INDEX "StorePage_companyId_isPublished_idx" ON "StorePage"("companyId", "isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "StorePage_companyId_slug_key" ON "StorePage"("companyId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE INDEX "Invite_companyId_token_idx" ON "Invite"("companyId", "token");

-- CreateIndex
CREATE INDEX "Invite_adminId_idx" ON "Invite"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionTransaction_reference_key" ON "SubscriptionTransaction"("reference");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_companyId_createdAt_idx" ON "SubscriptionTransaction"("companyId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Order_reference_key" ON "Order"("reference");

-- CreateIndex
CREATE INDEX "Order_companyId_status_idx" ON "Order"("companyId", "status");

-- CreateIndex
CREATE INDEX "Order_companyId_settlementStatus_idx" ON "Order"("companyId", "settlementStatus");

-- CreateIndex
CREATE INDEX "Order_companyId_createdAt_idx" ON "Order"("companyId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Order_invoiceNumber_idx" ON "Order"("invoiceNumber");

-- CreateIndex
CREATE INDEX "Product_companyId_category_idx" ON "Product"("companyId", "category");

-- CreateIndex
CREATE INDEX "Product_companyId_isAvailable_idx" ON "Product"("companyId", "isAvailable");

-- CreateIndex
CREATE INDEX "AppealRequest_companyId_status_idx" ON "AppealRequest"("companyId", "status");

-- CreateIndex
CREATE INDEX "CustomPlanQuote_companyId_status_idx" ON "CustomPlanQuote"("companyId", "status");

-- CreateIndex
CREATE INDEX "CustomPlanQuote_userId_status_idx" ON "CustomPlanQuote"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformTicket_ticketNumber_key" ON "PlatformTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "PlatformTicket_companyId_status_idx" ON "PlatformTicket"("companyId", "status");

-- CreateIndex
CREATE INDEX "PlatformTicket_type_status_idx" ON "PlatformTicket"("type", "status");

-- CreateIndex
CREATE INDEX "PlatformTicket_orderReference_idx" ON "PlatformTicket"("orderReference");

-- CreateIndex
CREATE INDEX "PlatformTicket_ticketNumber_idx" ON "PlatformTicket"("ticketNumber");

-- CreateIndex
CREATE INDEX "AnalyticsMetrics_companyId_date_idx" ON "AnalyticsMetrics"("companyId", "date");

-- CreateIndex
CREATE INDEX "Image_companyId_idx" ON "Image"("companyId");

-- CreateIndex
CREATE INDEX "Image_adminId_idx" ON "Image"("adminId");

-- CreateIndex
CREATE INDEX "Image_itemGroupId_idx" ON "Image"("itemGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "SiteSetting_companyId_key" ON "SiteSetting"("companyId");

-- AddForeignKey
ALTER TABLE "TemplatePage" ADD CONSTRAINT "TemplatePage_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_activeTemplateId_fkey" FOREIGN KEY ("activeTemplateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyMember" ADD CONSTRAINT "CompanyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorePage" ADD CONSTRAINT "StorePage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionTransaction" ADD CONSTRAINT "SubscriptionTransaction_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSetting" ADD CONSTRAINT "SiteSetting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsMetrics" ADD CONSTRAINT "AnalyticsMetrics_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealRequest" ADD CONSTRAINT "AppealRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPlanQuote" ADD CONSTRAINT "CustomPlanQuote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPlanQuote" ADD CONSTRAINT "CustomPlanQuote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformTicket" ADD CONSTRAINT "PlatformTicket_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformTicket" ADD CONSTRAINT "PlatformTicket_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
