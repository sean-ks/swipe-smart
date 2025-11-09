import { Category, RewardType } from '../../../../generated/prisma';
import { CardWithDetails } from './types';

/**
 * Calculate average monthly spending from lifetime spending and credit history
 */
export function calculateAvgMonthlySpending(
  lifetimeSpendingByCategory: Partial<Record<Category, number>>,
  creditHistoryYears: number
): number {
  if (creditHistoryYears <= 0) {
    return 0;
  }

  const totalLifetimeSpending = Object.values(lifetimeSpendingByCategory).reduce(
    (sum, amount) => sum + (amount || 0),
    0
  );

  return totalLifetimeSpending / (creditHistoryYears * 12);
}

/**
 * Calculate yearly spending by category
 */
export function calculateYearlySpendingByCategory(
  lifetimeSpendingByCategory: Partial<Record<Category, number>>,
  creditHistoryYears: number
): Partial<Record<Category, number>> {
  if (creditHistoryYears <= 0) {
    return {};
  }

  const yearlySpending: Partial<Record<Category, number>> = {};

  for (const [category, lifetimeAmount] of Object.entries(lifetimeSpendingByCategory)) {
    if (lifetimeAmount !== undefined) {
      yearlySpending[category as Category] = lifetimeAmount / creditHistoryYears;
    }
  }

  return yearlySpending;
}

/**
 * Check if user can feasibly earn the welcome bonus
 */
export function isBonusFeasible(
  card: CardWithDetails,
  avgMonthlySpending: number
): boolean {
  // Find WELCOME bonus
  const welcomeBonus = card.bonuses.find((b) => b.kind === 'WELCOME');

  // If no bonus, it's feasible (no requirement to meet)
  if (!welcomeBonus) {
    return true;
  }

  // If bonus has no minimum spend requirement, it's feasible
  if (!welcomeBonus.minSpendCents || welcomeBonus.minSpendCents === 0) {
    return true;
  }

  // Check if user can hit the minimum spend within the bonus window
  const userSpendingInWindow = avgMonthlySpending * welcomeBonus.windowMonths;
  return userSpendingInWindow >= welcomeBonus.minSpendCents;
}

/**
 * Calculate bonus value in cents (converted to cash for travel cards)
 */
export function calculateBonusValue(
  card: CardWithDetails,
  rewardType: RewardType | null
): number {
  const welcomeBonus = card.bonuses.find((b) => b.kind === 'WELCOME');

  // No bonus
  if (!welcomeBonus) {
    return 0;
  }

  // Cashback card with cash bonus
  if (rewardType === 'CASHBACK' && welcomeBonus.cashCents) {
    return welcomeBonus.cashCents;
  }

  // Travel card with points bonus - convert to cash using valuation
  if (rewardType === 'TRAVEL' && welcomeBonus.points && card.valuationCpp) {
    // valuationCpp is cents per point (e.g., 0.02 means 2 cents per point)
    // Convert Decimal to number
    const cppValue = typeof card.valuationCpp === 'number'
      ? card.valuationCpp
      : parseFloat(card.valuationCpp.toString());
    return welcomeBonus.points * cppValue;
  }

  // If card has cash bonus, use it regardless
  if (welcomeBonus.cashCents) {
    return welcomeBonus.cashCents;
  }

  // Default: no bonus value
  return 0;
}

/**
 * Calculate 2-year cashback value from earn rates
 */
export function calculateTwoYearCashback(
  card: CardWithDetails,
  yearlySpendingByCategory: Partial<Record<Category, number>>,
  rewardType: RewardType | null
): number {
  let twoYearCashback = 0;

  // For each spending category, calculate rewards
  for (const [category, yearlySpending] of Object.entries(yearlySpendingByCategory)) {
    if (!yearlySpending) continue;

    // Find the earn rate for this category
    const earnRate = card.earnRates.find((rate) => rate.category === category);

    if (earnRate) {
      // Convert Decimal to number
      const ratePctValue = typeof earnRate.ratePct === 'number'
        ? earnRate.ratePct
        : parseFloat(earnRate.ratePct.toString());

      // Calculate value for this category over 2 years
      // For CASHBACK cards: ratePct is percentage (e.g., 3.0 = 3%)
      // For TRAVEL cards: ratePct is points per dollar (e.g., 2.0 = 2x points)
      let categoryValue: number;

      if (rewardType === 'TRAVEL') {
        // Travel cards: ratePct = points per dollar, multiply by spending to get points
        // Then convert points to cash value using cpp
        const cppValue = card.valuationCpp
          ? (typeof card.valuationCpp === 'number'
              ? card.valuationCpp
              : parseFloat(card.valuationCpp.toString()))
          : 0;

        // Points earned = spending * points_per_dollar * 2 years
        // Cash value = points * cents_per_point
        categoryValue = yearlySpending * ratePctValue * 2 * cppValue;
      } else {
        // Cashback cards: ratePct is percentage, divide by 100
        categoryValue = yearlySpending * (ratePctValue / 100) * 2;
      }

      twoYearCashback += categoryValue;
    }
    // If no earn rate for this category, it contributes 0
  }

  return twoYearCashback;
}

/**
 * Calculate total 2-year value (cashback + bonus - fees)
 */
export function calculateTwoYearValue(
  card: CardWithDetails,
  yearlySpendingByCategory: Partial<Record<Category, number>>,
  avgMonthlySpending: number
): {
  totalValue: number;
  twoYearCashback: number;
  bonusValue: number;
  twoYearFees: number;
} {
  const twoYearCashback = calculateTwoYearCashback(
    card,
    yearlySpendingByCategory,
    card.RewardType
  );

  const bonusValue = calculateBonusValue(card, card.RewardType);

  const twoYearFees = card.annualFeeCents * 2;

  const totalValue = twoYearCashback + bonusValue - twoYearFees;

  return {
    totalValue,
    twoYearCashback,
    bonusValue,
    twoYearFees,
  };
}
