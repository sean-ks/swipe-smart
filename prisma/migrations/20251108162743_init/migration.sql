-- CreateEnum
CREATE TYPE "ScoreBand" AS ENUM ('BAND_660_699', 'BAND_700_749', 'BAND_750_PLUS');

-- CreateEnum
CREATE TYPE "PreferenceType" AS ENUM ('CASHBACK', 'TRAVEL');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('groceries', 'dining', 'gas', 'transit', 'travel', 'online', 'general', 'utilities', 'streaming', 'drugstore');

-- CreateEnum
CREATE TYPE "CardNetwork" AS ENUM ('VISA', 'MASTERCARD', 'AMEX', 'DISCOVER');

-- CreateEnum
CREATE TYPE "SwitchJobStatus" AS ENUM ('pending', 'running', 'done', 'failed');

-- CreateEnum
CREATE TYPE "SwitchEventStatus" AS ENUM ('queued', 'in_progress', 'updated', 'error');

-- CreateEnum
CREATE TYPE "AuditArtifactType" AS ENUM ('CSV', 'JSON', 'PDF');

-- CreateTable
CREATE TABLE "Profile" (
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "UserPrefs" (
    "userId" UUID NOT NULL,
    "scoreBand" "ScoreBand" NOT NULL,
    "creditHistoryYears" INTEGER NOT NULL DEFAULT 0,
    "maxActiveCards" INTEGER NOT NULL DEFAULT 2,
    "annualFeeCapCents" INTEGER NOT NULL DEFAULT 0,
    "preference" "PreferenceType" NOT NULL DEFAULT 'CASHBACK',
    "allowAnnualFees" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserPrefs_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "SpendProfileMonthly" (
    "userId" UUID NOT NULL,
    "month" DATE NOT NULL,
    "category" "Category" NOT NULL,
    "amountCents" INTEGER NOT NULL,

    CONSTRAINT "SpendProfileMonthly_pkey" PRIMARY KEY ("userId","month","category")
);

-- CreateTable
CREATE TABLE "MerchantProfileMonthly" (
    "userId" UUID NOT NULL,
    "month" DATE NOT NULL,
    "merchant" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "amountCents" INTEGER NOT NULL,

    CONSTRAINT "MerchantProfileMonthly_pkey" PRIMARY KEY ("userId","month","merchant","category")
);

-- CreateTable
CREATE TABLE "CardsCatalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "network" "CardNetwork" NOT NULL,
    "isChargeCard" BOOLEAN NOT NULL DEFAULT false,
    "annualFeeCents" INTEGER NOT NULL DEFAULT 0,
    "feeCreditsCents" INTEGER NOT NULL DEFAULT 0,
    "minScoreBand" "ScoreBand" NOT NULL,
    "valuationCpp" DECIMAL(6,3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardsCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardEarnRate" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "ratePct" DECIMAL(6,4) NOT NULL,

    CONSTRAINT "CardEarnRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardBonus" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "points" INTEGER,
    "cashCents" INTEGER,
    "windowMonths" INTEGER NOT NULL,
    "minSpendCents" INTEGER NOT NULL,

    CONSTRAINT "CardBonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardPacing" (
    "cardId" TEXT NOT NULL,
    "minDaysBetweenNewCards" INTEGER NOT NULL DEFAULT 90,

    CONSTRAINT "CardPacing_pkey" PRIMARY KEY ("cardId")
);

-- CreateTable
CREATE TABLE "UserCard" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "cardCatalogId" TEXT,
    "issuer" TEXT,
    "network" "CardNetwork",
    "last4" TEXT,
    "annualFeeCents" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "openedAt" TIMESTAMP(3),

    CONSTRAINT "UserCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMerchant" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "knotMerchantId" TEXT,
    "connected" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMerchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationRun" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inputsVersion" TEXT,
    "inputsJson" JSONB NOT NULL,
    "baselineValueCents" INTEGER NOT NULL,
    "optimizedValueCents" INTEGER NOT NULL,

    CONSTRAINT "RecommendationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationPick" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "cardCatalogId" TEXT NOT NULL,
    "applyAtMonth" INTEGER NOT NULL DEFAULT 0,
    "fyvCents" INTEGER NOT NULL,
    "netFeeCents" INTEGER NOT NULL,
    "minSpendCents" INTEGER NOT NULL,
    "windowMonths" INTEGER NOT NULL,
    "feasible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RecommendationPick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutingRecommendation" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "merchant" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "currentCardName" TEXT,
    "newCardCatalogId" TEXT,
    "deltaCents" INTEGER NOT NULL,

    CONSTRAINT "RoutingRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonusProgress" (
    "userId" UUID NOT NULL,
    "cardCatalogId" TEXT NOT NULL,
    "windowStart" DATE NOT NULL,
    "spentCents" INTEGER NOT NULL DEFAULT 0,
    "targetCents" INTEGER NOT NULL,

    CONSTRAINT "BonusProgress_pkey" PRIMARY KEY ("userId","cardCatalogId","windowStart")
);

-- CreateTable
CREATE TABLE "SwitchJob" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "status" "SwitchJobStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetCardId" TEXT,
    "note" TEXT,

    CONSTRAINT "SwitchJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwitchEvent" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "status" "SwitchEventStatus" NOT NULL,
    "detailsJson" JSONB,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SwitchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SwitchAuditArtifact" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "kind" "AuditArtifactType" NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SwitchAuditArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Profile_createdAt_idx" ON "Profile"("createdAt");

-- CreateIndex
CREATE INDEX "SpendProfileMonthly_userId_month_idx" ON "SpendProfileMonthly"("userId", "month");

-- CreateIndex
CREATE INDEX "MerchantProfileMonthly_userId_month_idx" ON "MerchantProfileMonthly"("userId", "month");

-- CreateIndex
CREATE INDEX "MerchantProfileMonthly_userId_merchant_idx" ON "MerchantProfileMonthly"("userId", "merchant");

-- CreateIndex
CREATE INDEX "CardsCatalog_active_idx" ON "CardsCatalog"("active");

-- CreateIndex
CREATE INDEX "CardsCatalog_issuer_idx" ON "CardsCatalog"("issuer");

-- CreateIndex
CREATE INDEX "CardsCatalog_network_idx" ON "CardsCatalog"("network");

-- CreateIndex
CREATE INDEX "CardEarnRate_cardId_idx" ON "CardEarnRate"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "CardEarnRate_cardId_category_key" ON "CardEarnRate"("cardId", "category");

-- CreateIndex
CREATE INDEX "CardBonus_cardId_idx" ON "CardBonus"("cardId");

-- CreateIndex
CREATE INDEX "UserCard_userId_idx" ON "UserCard"("userId");

-- CreateIndex
CREATE INDEX "UserCard_cardCatalogId_idx" ON "UserCard"("cardCatalogId");

-- CreateIndex
CREATE INDEX "UserMerchant_userId_idx" ON "UserMerchant"("userId");

-- CreateIndex
CREATE INDEX "UserMerchant_knotMerchantId_idx" ON "UserMerchant"("knotMerchantId");

-- CreateIndex
CREATE INDEX "RecommendationRun_userId_createdAt_idx" ON "RecommendationRun"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "RecommendationPick_runId_idx" ON "RecommendationPick"("runId");

-- CreateIndex
CREATE INDEX "RecommendationPick_cardCatalogId_idx" ON "RecommendationPick"("cardCatalogId");

-- CreateIndex
CREATE INDEX "RoutingRecommendation_runId_idx" ON "RoutingRecommendation"("runId");

-- CreateIndex
CREATE INDEX "RoutingRecommendation_merchant_idx" ON "RoutingRecommendation"("merchant");

-- CreateIndex
CREATE INDEX "BonusProgress_userId_windowStart_idx" ON "BonusProgress"("userId", "windowStart");

-- CreateIndex
CREATE INDEX "SwitchJob_userId_createdAt_idx" ON "SwitchJob"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SwitchEvent_jobId_ts_idx" ON "SwitchEvent"("jobId", "ts");

-- CreateIndex
CREATE INDEX "SwitchEvent_merchantId_idx" ON "SwitchEvent"("merchantId");

-- CreateIndex
CREATE INDEX "SwitchAuditArtifact_jobId_createdAt_idx" ON "SwitchAuditArtifact"("jobId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserPrefs" ADD CONSTRAINT "UserPrefs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpendProfileMonthly" ADD CONSTRAINT "SpendProfileMonthly_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MerchantProfileMonthly" ADD CONSTRAINT "MerchantProfileMonthly_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardEarnRate" ADD CONSTRAINT "CardEarnRate_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CardsCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardBonus" ADD CONSTRAINT "CardBonus_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CardsCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardPacing" ADD CONSTRAINT "CardPacing_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "CardsCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCard" ADD CONSTRAINT "UserCard_cardCatalogId_fkey" FOREIGN KEY ("cardCatalogId") REFERENCES "CardsCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMerchant" ADD CONSTRAINT "UserMerchant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationRun" ADD CONSTRAINT "RecommendationRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationPick" ADD CONSTRAINT "RecommendationPick_runId_fkey" FOREIGN KEY ("runId") REFERENCES "RecommendationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationPick" ADD CONSTRAINT "RecommendationPick_cardCatalogId_fkey" FOREIGN KEY ("cardCatalogId") REFERENCES "CardsCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutingRecommendation" ADD CONSTRAINT "RoutingRecommendation_runId_fkey" FOREIGN KEY ("runId") REFERENCES "RecommendationRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutingRecommendation" ADD CONSTRAINT "RoutingRecommendation_newCardCatalogId_fkey" FOREIGN KEY ("newCardCatalogId") REFERENCES "CardsCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusProgress" ADD CONSTRAINT "BonusProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusProgress" ADD CONSTRAINT "BonusProgress_cardCatalogId_fkey" FOREIGN KEY ("cardCatalogId") REFERENCES "CardsCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwitchJob" ADD CONSTRAINT "SwitchJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwitchEvent" ADD CONSTRAINT "SwitchEvent_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "SwitchJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwitchEvent" ADD CONSTRAINT "SwitchEvent_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "UserMerchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwitchAuditArtifact" ADD CONSTRAINT "SwitchAuditArtifact_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "SwitchJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
