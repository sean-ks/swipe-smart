import { Category, RewardType } from '../../../../generated/prisma';

/**
 * Input parameters for card recommendation algorithm
 */
export interface CardRecommendationInput {
  /** User's reward preference (CASHBACK, TRAVEL, or MISCELLANEOUS) */
  rewardPreference: RewardType;

  /** User's credit score */
  userCreditScore: number;

  /** User's credit history in years */
  creditHistoryYears: number;

  /** Lifetime spending by category in cents */
  lifetimeSpendingByCategory: Partial<Record<Category, number>>;

  /** Number of top cards to return */
  limit: number;

  /** If true, only include test cards (isTestCard = true). For testing purposes only. */
  testMode?: boolean;
}

/**
 * Card recommendation result with calculated 2-year value
 */
export interface CardRecommendation {
  /** Card ID */
  cardId: string;

  /** Card name */
  cardName: string;

  /** Card issuer */
  issuer: string;

  /** Reward type (null for credit-building cards) */
  rewardType: RewardType | null;

  /** Annual fee in cents */
  annualFeeCents: number;

  /** Total 2-year value in cents (cashback + bonus - fees) */
  totalTwoYearValue: number;

  /** 2-year cashback/points value in cents */
  twoYearCashback: number;

  /** Sign-up bonus value in cents (converted to cash for travel cards) */
  bonusValue: number;

  /** Total fees over 2 years in cents */
  twoYearFees: number;

  /** Earn rates by category */
  categoryRates: Array<{
    category: Category;
    ratePct: number;
  }>;

  /** Minimum credit score required (null if no requirement) */
  minCreditScore: number | null;
}

/**
 * Internal card data with all necessary relations
 * Uses Prisma's Decimal type for precise decimal values
 */
export interface CardWithDetails {
  id: string;
  name: string;
  issuer: string;
  RewardType: RewardType | null;
  annualFeeCents: number;
  minCreditScore: number | null;
  valuationCpp: any; // Prisma Decimal type
  earnRates: Array<{
    category: Category;
    ratePct: any; // Prisma Decimal type
    capAmountCents: number | null;
    capWindowMonths: number | null;
    isRotating: boolean;
  }>;
  bonuses: Array<{
    kind: string;
    points: number | null;
    cashCents: number | null;
    windowMonths: number;
    minSpendCents: number;
  }>;
  eligibility: {
    suggestedHistoryYears: number | null;
  } | null;
  rotating: Array<{
    quarter: number | null;
    categories: string[];
  }>;
}

/**
 * Input parameters for card path generation
 */
export interface PathGenerationInput {
  /** User's reward preference (CASHBACK, TRAVEL, or MISCELLANEOUS) */
  rewardPreference: RewardType;

  /** User's current credit score */
  userCreditScore: number;

  /** User's current credit history in years */
  creditHistoryYears: number;

  /** Lifetime spending by category in cents */
  lifetimeSpendingByCategory: Partial<Record<Category, number>>;

  /** Selected card ID from initial recommendations */
  selectedCardId: string;

  /** If true, only include test cards (isTestCard = true). For testing purposes only. */
  testMode?: boolean;
}

/**
 * Single step in a credit card progression path
 */
export interface CardPathStep {
  /** Step number (0-indexed) */
  stepNumber: number;

  /** Timeframe for this step (e.g., "Year 0-2", "Year 2-4") */
  timeframe: string;

  /** Card recommendation for this step */
  card: CardRecommendation;

  /** User's credit score at the start of this step */
  creditScoreAtStep: number;

  /** User's credit history years at the start of this step */
  creditHistoryAtStep: number;

  /** Expected credit score improvement from using this card (points) */
  creditScoreImprovement: number;
}

/**
 * Complete credit card progression path
 */
export interface CardPath {
  /** All steps in the progression path */
  steps: CardPathStep[];

  /** Total value across all cards in the path (cents) */
  totalPathValue: number;

  /** Total cashback/rewards across all cards (cents) */
  totalCashback: number;

  /** Total bonuses across all cards (cents) */
  totalBonuses: number;

  /** Total fees across all cards (cents) */
  totalFees: number;

  /** Final credit score after completing the path */
  finalCreditScore: number;

  /** Total duration of the path in years */
  totalDurationYears: number;
}
