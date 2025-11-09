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
