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
 * Calculate 2-year cashback for cards with rotating categories
 */
function calculateRotatingCashback(
  card: CardWithDetails,
  yearlySpendingByCategory: Partial<Record<Category, number>>,
  rewardType: RewardType | null
): number {
  let twoYearCashback = 0;

  // Build a map of which categories are in rotation and in how many quarters
  const rotatingCategoryMap = new Map<string, number>();
  const totalQuarters = card.rotating.length;

  // Count how many quarters each category appears in
  card.rotating.forEach(schedule => {
    schedule.categories.forEach(category => {
      const count = rotatingCategoryMap.get(category) || 0;
      rotatingCategoryMap.set(category, count + 1);
    });
  });

  // Find the rotating earn rate (usually the highest rate)
  const rotatingRate = card.earnRates.find(r => r.isRotating);
  const baseRate = card.earnRates.find(r => r.category === 'general');

  if (!rotatingRate) {
    // No rotating rate found, fall back to regular calculation
    return calculateRegularCashback(card, yearlySpendingByCategory, rewardType);
  }

  const rotatingRatePct = typeof rotatingRate.ratePct === 'number'
    ? rotatingRate.ratePct
    : parseFloat(rotatingRate.ratePct.toString());

  const baseRatePct = baseRate
    ? (typeof baseRate.ratePct === 'number'
        ? baseRate.ratePct
        : parseFloat(baseRate.ratePct.toString()))
    : 0.01;

  // For each spending category
  for (const [category, yearlySpending] of Object.entries(yearlySpendingByCategory)) {
    if (!yearlySpending) continue;

    const quartersActive = rotatingCategoryMap.get(category);

    if (quartersActive) {
      // This category is in rotation for some quarters
      // Calculate average spending per quarter that gets bonus rate
      const avgSpendingPerQuarter = yearlySpending / 4;
      const bonusSpendingPerYear = avgSpendingPerQuarter * quartersActive;

      // Apply cap if it exists (e.g., Discover it: $1,500/quarter)
      let cappedBonusSpending = bonusSpendingPerYear;
      if (rotatingRate.capAmountCents && rotatingRate.capWindowMonths) {
        const windowsPerYear = 12 / rotatingRate.capWindowMonths;
        const maxBonusSpendingPerYear = rotatingRate.capAmountCents * windowsPerYear;
        cappedBonusSpending = Math.min(bonusSpendingPerYear, maxBonusSpendingPerYear);
      }

      // Calculate value based on card type
      if (rewardType === 'TRAVEL') {
        const cppValue = card.valuationCpp
          ? (typeof card.valuationCpp === 'number'
              ? card.valuationCpp
              : parseFloat(card.valuationCpp.toString()))
          : 0;
        twoYearCashback += cappedBonusSpending * rotatingRatePct * 2 * cppValue;
      } else {
        twoYearCashback += cappedBonusSpending * rotatingRatePct * 2;
      }

      // Remaining spending earns base rate
      const remainingSpending = yearlySpending - cappedBonusSpending;
      if (remainingSpending > 0) {
        if (rewardType === 'TRAVEL') {
          const cppValue = card.valuationCpp
            ? (typeof card.valuationCpp === 'number'
                ? card.valuationCpp
                : parseFloat(card.valuationCpp.toString()))
            : 0;
          twoYearCashback += remainingSpending * baseRatePct * 2 * cppValue;
        } else {
          twoYearCashback += remainingSpending * baseRatePct * 2;
        }
      }
    } else {
      // This category is not in rotation, earns base rate
      if (rewardType === 'TRAVEL') {
        const cppValue = card.valuationCpp
          ? (typeof card.valuationCpp === 'number'
              ? card.valuationCpp
              : parseFloat(card.valuationCpp.toString()))
          : 0;
        twoYearCashback += yearlySpending * baseRatePct * 2 * cppValue;
      } else {
        twoYearCashback += yearlySpending * baseRatePct * 2;
      }
    }
  }

  return twoYearCashback;
}

/**
 * Calculate 2-year cashback for regular (non-rotating) cards
 */
function calculateRegularCashback(
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
      // For CASHBACK cards: ratePct is decimal (e.g., 0.03 = 3%)
      // For TRAVEL cards: ratePct is points per dollar (e.g., 2.0 = 2x points)
      let categoryValue: number;

      // Check if this earn rate has a spending cap
      if (earnRate.capAmountCents && earnRate.capWindowMonths) {
        // Calculate max bonus spending per year based on cap window
        // Example: $6,000 cap per 12 months = $6,000/year max bonus spending
        // Example: $500 cap per 1 month = $500 * 12 = $6,000/year max bonus spending
        const windowsPerYear = 12 / earnRate.capWindowMonths;
        const maxBonusSpendingPerYear = earnRate.capAmountCents * windowsPerYear;

        // Split spending into capped (bonus rate) and excess (base rate)
        const cappedYearlySpending = Math.min(yearlySpending, maxBonusSpendingPerYear);
        const excessYearlySpending = Math.max(0, yearlySpending - maxBonusSpendingPerYear);

        if (rewardType === 'TRAVEL') {
          // Travel cards: apply cpp conversion
          const cppValue = card.valuationCpp
            ? (typeof card.valuationCpp === 'number'
                ? card.valuationCpp
                : parseFloat(card.valuationCpp.toString()))
            : 0;

          // Capped spending earns bonus rate
          categoryValue = cappedYearlySpending * ratePctValue * 2 * cppValue;

          // Excess spending earns base rate (typically 1x points)
          // Assume base rate is 1x for excess spending
          categoryValue += excessYearlySpending * 1.0 * 2 * cppValue;
        } else {
          // Cashback cards: capped spending earns bonus rate
          categoryValue = cappedYearlySpending * ratePctValue * 2;

          // Excess spending earns base rate (typically 1%)
          // Assume base rate is 0.01 (1%) for excess spending
          categoryValue += excessYearlySpending * 0.01 * 2;
        }
      } else {
        // No cap - original logic
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
          // Cashback cards: ratePct is already a decimal (e.g., 0.03 = 3%)
          categoryValue = yearlySpending * ratePctValue * 2;
        }
      }

      twoYearCashback += categoryValue;
    }
    // If no earn rate for this category, it contributes 0
  }

  return twoYearCashback;
}

/**
 * Calculate 2-year cashback for Citi Custom Cash
 * Special handling: 5% on top spending category (up to $500/month), 1% on everything else
 */
function calculateCitiCustomCashback(
  card: CardWithDetails,
  yearlySpendingByCategory: Partial<Record<Category, number>>,
  rewardType: RewardType | null
): number {
  let twoYearCashback = 0;

  // Find the top spending category
  let topCategory: string | null = null;
  let topSpending = 0;

  for (const [category, yearlySpending] of Object.entries(yearlySpendingByCategory)) {
    if (yearlySpending && yearlySpending > topSpending) {
      topSpending = yearlySpending;
      topCategory = category;
    }
  }

  // Calculate cashback for each category
  for (const [category, yearlySpending] of Object.entries(yearlySpendingByCategory)) {
    if (!yearlySpending) continue;

    if (category === topCategory) {
      // Top category gets 5% up to $500/month = $6,000/year
      const maxBonusSpendingPerYear = 50000 * 12; // $500/month × 12 months = $6,000/year
      const cappedYearlySpending = Math.min(yearlySpending, maxBonusSpendingPerYear);
      const excessYearlySpending = Math.max(0, yearlySpending - maxBonusSpendingPerYear);

      // Apply 5% to capped spending
      twoYearCashback += cappedYearlySpending * 0.05 * 2;

      // Apply 1% to excess spending
      twoYearCashback += excessYearlySpending * 0.01 * 2;
    } else {
      // All other categories get 1%
      twoYearCashback += yearlySpending * 0.01 * 2;
    }
  }

  return twoYearCashback;
}

/**
 * Calculate 2-year cashback value from earn rates
 * Routes to rotating or regular calculation based on card type
 */
export function calculateTwoYearCashback(
  card: CardWithDetails,
  yearlySpendingByCategory: Partial<Record<Category, number>>,
  rewardType: RewardType | null
): number {
  // Special handling for Citi Custom Cash
  if (card.name.includes('Custom Cash') && card.issuer === 'Citi') {
    return calculateCitiCustomCashback(card, yearlySpendingByCategory, rewardType);
  }

  // Check if card has rotating categories
  if (card.rotating && card.rotating.length > 0) {
    return calculateRotatingCashback(card, yearlySpendingByCategory, rewardType);
  }

  // Otherwise use regular calculation
  return calculateRegularCashback(card, yearlySpendingByCategory, rewardType);
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
