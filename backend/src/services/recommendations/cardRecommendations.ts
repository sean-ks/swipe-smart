import { prisma } from '../../utils/prisma';
import { CardRecommendationInput, CardRecommendation, CardWithDetails } from './types';
import {
  calculateAvgMonthlySpending,
  calculateYearlySpendingByCategory,
  isBonusFeasible,
  calculateTwoYearValue,
} from './helpers';

/**
 * Get top credit card recommendations based on user preferences and spending
 */
export async function getTopCardRecommendations(
  input: CardRecommendationInput
): Promise<CardRecommendation[]> {
  const {
    rewardPreference,
    userCreditScore,
    creditHistoryYears,
    lifetimeSpendingByCategory,
    limit,
    testMode = false,
  } = input;

  // Calculate spending metrics
  const avgMonthlySpending = calculateAvgMonthlySpending(
    lifetimeSpendingByCategory,
    creditHistoryYears
  );

  const yearlySpendingByCategory = calculateYearlySpendingByCategory(
    lifetimeSpendingByCategory,
    creditHistoryYears
  );

  // Step 1: Query eligible cards from database
  const cards = await prisma.cardsCatalog.findMany({
    where: {
      AND: [
        {
          // Filter by reward type: user preference OR null (credit-building cards)
          OR: [
            { RewardType: rewardPreference },
            { RewardType: null },
          ],
        },
        {
          // Filter by credit score: user qualifies OR no requirement
          OR: [
            { minCreditScore: { lte: userCreditScore } },
            { minCreditScore: null },
          ],
        },
        // In test mode, only include test cards
        ...(testMode ? [{ isTestCard: true }] : []),
      ],
    },
    include: {
      earnRates: {
        select: {
          category: true,
          ratePct: true,
          capAmountCents: true,
          capWindowMonths: true,
          isRotating: true,
        },
      },
      bonuses: {
        where: {
          kind: 'WELCOME',
        },
        select: {
          kind: true,
          points: true,
          cashCents: true,
          windowMonths: true,
          minSpendCents: true,
        },
      },
      eligibility: {
        select: {
          suggestedHistoryYears: true,
        },
      },
      rotating: {
        select: {
          quarter: true,
          categories: true,
        },
      },
    },
  });

  // Step 2: Filter by credit history and bonus feasibility
  const eligibleCards = cards.filter((card) => {
    // Check credit history requirement
    if (
      card.eligibility?.suggestedHistoryYears &&
      creditHistoryYears < card.eligibility.suggestedHistoryYears
    ) {
      return false;
    }

    // Check bonus feasibility
    return isBonusFeasible(card as CardWithDetails, avgMonthlySpending);
  });

  // Step 3: Calculate 2-year value for each eligible card
  const cardsWithValues = eligibleCards.map((card) => {
    const { totalValue, twoYearCashback, bonusValue, twoYearFees } =
      calculateTwoYearValue(
        card as CardWithDetails,
        yearlySpendingByCategory,
        avgMonthlySpending
      );

    const recommendation: CardRecommendation = {
      cardId: card.id,
      cardName: card.name,
      issuer: card.issuer,
      rewardType: card.RewardType,
      annualFeeCents: card.annualFeeCents,
      totalTwoYearValue: totalValue,
      twoYearCashback,
      bonusValue,
      twoYearFees,
      categoryRates: card.earnRates.map((rate) => ({
        category: rate.category,
        ratePct: typeof rate.ratePct === 'number'
          ? rate.ratePct
          : parseFloat(rate.ratePct.toString()),
      })),
      minCreditScore: card.minCreditScore,
    };

    return recommendation;
  });

  // Step 4: Sort by total 2-year value (descending) and return top K
  const sortedRecommendations = cardsWithValues.sort(
    (a, b) => b.totalTwoYearValue - a.totalTwoYearValue
  );

  return sortedRecommendations.slice(0, limit);
}
