import { prisma } from '../../utils/prisma';
import {
  PathGenerationInput,
  CardPath,
  CardPathStep,
  CardRecommendation,
  CardRecommendationInput,
} from './types';
import { getTopCardRecommendations } from './cardRecommendations';
import { RewardType, Category } from '../../../../generated/prisma';

/**
 * Grow lifetime spending by adding new spending over the step duration
 * Accounts for annual spending growth rate
 *
 * @param currentLifetimeSpending Current lifetime spending by category
 * @param currentCreditHistory Current credit history in years
 * @param stepDurationYears Duration of the step in years
 * @param annualGrowthRate Annual spending growth rate (e.g., 0.10 for 10%)
 * @returns Updated lifetime spending with growth applied
 */
function growLifetimeSpending(
  currentLifetimeSpending: Partial<Record<Category, number>>,
  currentCreditHistory: number,
  stepDurationYears: number,
  annualGrowthRate: number
): Partial<Record<Category, number>> {
  const updatedSpending: Partial<Record<Category, number>> = {};

  // Calculate current annual spending rate for each category
  for (const [category, lifetimeAmount] of Object.entries(currentLifetimeSpending)) {
    if (lifetimeAmount === undefined) continue;

    // Current annual spending rate
    const currentAnnualSpending = currentCreditHistory > 0
      ? lifetimeAmount / currentCreditHistory
      : lifetimeAmount;

    // Calculate spending for each year of the step with growth
    let totalNewSpending = 0;
    for (let year = 0; year < stepDurationYears; year++) {
      const yearSpending = currentAnnualSpending * Math.pow(1 + annualGrowthRate, year + 1);
      totalNewSpending += yearSpending;
    }

    // Add new spending to lifetime total
    updatedSpending[category as Category] = lifetimeAmount + totalNewSpending;
  }

  return updatedSpending;
}

/**
 * Calculate expected credit score improvement based on card type
 * Card-type based improvement over 2 years:
 * - Credit-builder/secured cards (no rewards): +30-40 points
 * - Basic cards (minCreditScore < 670): +25-30 points
 * - Mid-tier cards (670-740): +20-25 points
 * - Premium cards (>740): +15-20 points
 */
export function calculateCreditScoreImprovement(
  rewardType: RewardType | null,
  minCreditScore: number | null
): number {
  // Credit-builder/secured cards (no reward type)
  if (rewardType === null) {
    return 35; // Average of 30-40
  }

  // No minimum credit score means it's likely a basic card
  if (minCreditScore === null) {
    return 27; // Average of 25-30
  }

  // Basic cards
  if (minCreditScore < 670) {
    return 27; // Average of 25-30
  }

  // Mid-tier cards
  if (minCreditScore >= 670 && minCreditScore <= 740) {
    return 22; // Average of 20-25
  }

  // Premium cards
  return 17; // Average of 15-20
}

/**
 * Generate a credit card progression path
 * Iteratively recommends cards as user's credit improves over time
 */
export async function generateCardPath(
  input: PathGenerationInput
): Promise<CardPath> {
  const {
    rewardPreference,
    userCreditScore: initialCreditScore,
    creditHistoryYears: initialCreditHistory,
    lifetimeSpendingByCategory,
    selectedCardId,
    testMode = false,
  } = input;

  // Fetch the selected card details
  const selectedCard = await prisma.cardsCatalog.findUnique({
    where: { id: selectedCardId },
  });

  if (!selectedCard) {
    throw new Error(`Card with ID ${selectedCardId} not found`);
  }

  // Initialize path state
  const steps: CardPathStep[] = [];
  let currentCreditScore = initialCreditScore;
  let currentCreditHistory = initialCreditHistory;
  let currentLifetimeSpending = { ...lifetimeSpendingByCategory };
  let stepNumber = 0;
  const STEP_DURATION_YEARS = 2;
  const MAX_CREDIT_SCORE = 850;
  const PREMIUM_TIER_THRESHOLD = 740; // Premium cards start at 740+ credit score
  const ANNUAL_SPENDING_GROWTH_RATE = 0.40; // 20% per year - aspirational growth as users improve finances

  // Get initial recommendation for the selected card
  const initialRecommendations = await getTopCardRecommendations({
    rewardPreference,
    userCreditScore: currentCreditScore,
    creditHistoryYears: currentCreditHistory,
    lifetimeSpendingByCategory: currentLifetimeSpending,
    limit: 50, // Get more cards to find the selected one
    testMode,
  });

  const selectedCardRecommendation = initialRecommendations.find(
    (rec) => rec.cardId === selectedCardId
  );

  if (!selectedCardRecommendation) {
    throw new Error(
      `Selected card ${selectedCardId} is not eligible for user's current credit profile`
    );
  }

  // Add first step with selected card
  const firstStepImprovement = calculateCreditScoreImprovement(
    selectedCard.RewardType,
    selectedCard.minCreditScore
  );

  steps.push({
    stepNumber,
    timeframe: `Year ${stepNumber * STEP_DURATION_YEARS}-${(stepNumber + 1) * STEP_DURATION_YEARS}`,
    card: selectedCardRecommendation,
    creditScoreAtStep: currentCreditScore,
    creditHistoryAtStep: currentCreditHistory,
    creditScoreImprovement: firstStepImprovement,
  });

  // Check if first card is already premium tier - if so, we're done
  const isFirstCardPremium = selectedCard.minCreditScore !== null &&
                             selectedCard.minCreditScore >= PREMIUM_TIER_THRESHOLD;

  // Update state for next iteration
  currentCreditScore = Math.min(
    currentCreditScore + firstStepImprovement,
    MAX_CREDIT_SCORE
  );
  currentCreditHistory += STEP_DURATION_YEARS;

  // Grow spending for the next iteration
  currentLifetimeSpending = growLifetimeSpending(
    currentLifetimeSpending,
    currentCreditHistory - STEP_DURATION_YEARS, // Use history before this step
    STEP_DURATION_YEARS,
    ANNUAL_SPENDING_GROWTH_RATE
  );

  stepNumber++;

  // Iteratively find next best cards until reaching premium tier
  while (currentCreditScore < MAX_CREDIT_SCORE && !isFirstCardPremium) {
    // Get recommendations for improved credit state (with updated spending)
    const recommendations = await getTopCardRecommendations({
      rewardPreference,
      userCreditScore: currentCreditScore,
      creditHistoryYears: currentCreditHistory,
      lifetimeSpendingByCategory: currentLifetimeSpending,
      limit: 10,
      testMode,
    });

    // If no recommendations available, stop
    if (recommendations.length === 0) {
      break;
    }

    const bestCard = recommendations[0];

    // Check if we've reached premium tier (740+ credit score requirement)
    const isPremiumCard = bestCard.minCreditScore !== null &&
                          bestCard.minCreditScore >= PREMIUM_TIER_THRESHOLD;

    // Calculate credit score improvement for this card
    const improvement = calculateCreditScoreImprovement(
      bestCard.rewardType,
      bestCard.minCreditScore
    );

    // Add step to path
    steps.push({
      stepNumber,
      timeframe: `Year ${stepNumber * STEP_DURATION_YEARS}-${(stepNumber + 1) * STEP_DURATION_YEARS}`,
      card: bestCard,
      creditScoreAtStep: currentCreditScore,
      creditHistoryAtStep: currentCreditHistory,
      creditScoreImprovement: improvement,
    });

    // If we've reached a premium card, stop here (user has reached optimal tier)
    // Premium cards are 740+ credit requirement - these are the best tier
    if (isPremiumCard) {
      break;
    }

    // Update state for next iteration
    currentCreditScore = Math.min(
      currentCreditScore + improvement,
      MAX_CREDIT_SCORE
    );
    currentCreditHistory += STEP_DURATION_YEARS;

    // Grow spending for the next iteration
    currentLifetimeSpending = growLifetimeSpending(
      currentLifetimeSpending,
      currentCreditHistory - STEP_DURATION_YEARS, // Use history before this step
      STEP_DURATION_YEARS,
      ANNUAL_SPENDING_GROWTH_RATE
    );

    stepNumber++;

    // Safety limit: max 10 steps (20 years)
    if (stepNumber >= 10) {
      break;
    }
  }

  // Calculate totals
  const totalPathValue = steps.reduce(
    (sum, step) => sum + step.card.totalTwoYearValue,
    0
  );
  const totalCashback = steps.reduce(
    (sum, step) => sum + step.card.twoYearCashback,
    0
  );
  const totalBonuses = steps.reduce(
    (sum, step) => sum + step.card.bonusValue,
    0
  );
  const totalFees = steps.reduce(
    (sum, step) => sum + step.card.twoYearFees,
    0
  );

  const path: CardPath = {
    steps,
    totalPathValue,
    totalCashback,
    totalBonuses,
    totalFees,
    finalCreditScore: currentCreditScore,
    totalDurationYears: steps.length * STEP_DURATION_YEARS,
  };

  return path;
}
