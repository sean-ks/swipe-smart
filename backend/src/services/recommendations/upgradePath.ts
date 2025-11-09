import { getTopCardRecommendations } from './cardRecommendations';
import {
  UpgradePathInput,
  UpgradePath,
  UpgradePathCard,
} from './types';
import { Category } from '../../../../generated/prisma';

/**
 * Generate a simplified upgrade path showing card progression from starter to premium
 *
 * This algorithm:
 * 1. Starts with user's current credit score and spending
 * 2. Gets the best card for that tier
 * 3. Increments credit score and scales spending
 * 4. Repeats until reaching premium tier
 * 5. Returns 3-5 unique cards (targeting ~4 on average)
 * 6. If user already has cards, returns only the upgrade path from their current position
 *
 * Unlike cardPath.ts, this focuses only on the final card list without time tracking
 */
export async function generateUpgradePath(
  input: UpgradePathInput
): Promise<UpgradePath> {
  const {
    rewardPreference,
    userCreditScore: initialCreditScore,
    creditHistoryYears: initialCreditHistory,
    lifetimeSpendingByCategory,
    currentCardIds = [],
    testMode = false,
  } = input;

  const cards: UpgradePathCard[] = [];
  const seenCardIds = new Set<string>();

  // Configuration for targeting ~4 cards on average
  // Aggressive scaling to show full progression from starter to ultra-premium cards
  const CREDIT_SCORE_INCREMENT = 60; // 580 → 640 → 700 → 760 = 4 steps
  const SPENDING_MULTIPLIER = 3.0; // Aggressive 3x scaling to unlock all tiers ($10k → $30k → $90k → $270k)
  const CREDIT_HISTORY_INCREMENT = 2; // Add 2 years per step
  const MAX_CREDIT_SCORE = 850;
  const PREMIUM_TIER_THRESHOLD = 740; // Stop when we hit premium tier
  const MAX_ITERATIONS = 6; // Safety limit

  let currentCreditScore = initialCreditScore;
  let currentCreditHistory = initialCreditHistory;
  let currentSpending = { ...lifetimeSpendingByCategory };
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    // Get best card for current tier
    const recommendations = await getTopCardRecommendations({
      rewardPreference,
      userCreditScore: currentCreditScore,
      creditHistoryYears: currentCreditHistory,
      lifetimeSpendingByCategory: currentSpending,
      limit: 5,
      testMode,
    });

    // No recommendations available - stop
    if (recommendations.length === 0) {
      break;
    }

    const bestCard = recommendations[0];

    // Only add if we haven't seen this card before
    if (!seenCardIds.has(bestCard.cardId)) {
      cards.push({
        cardId: bestCard.cardId,
        cardName: bestCard.cardName,
        issuer: bestCard.issuer,
        rewardType: bestCard.rewardType,
        minCreditScore: bestCard.minCreditScore,
        annualFeeCents: bestCard.annualFeeCents,
      });
      seenCardIds.add(bestCard.cardId);
    }

    // Check if we've reached premium tier
    const isPremiumCard = bestCard.minCreditScore !== null &&
                          bestCard.minCreditScore >= PREMIUM_TIER_THRESHOLD;

    if (isPremiumCard) {
      // Reached premium tier - we're done
      break;
    }

    // Increment for next iteration
    currentCreditScore = Math.min(
      currentCreditScore + CREDIT_SCORE_INCREMENT,
      MAX_CREDIT_SCORE
    );

    currentCreditHistory += CREDIT_HISTORY_INCREMENT;

    // Scale spending by multiplier
    for (const [category, amount] of Object.entries(currentSpending)) {
      if (amount !== undefined) {
        currentSpending[category as Category] = Math.floor(amount * SPENDING_MULTIPLIER);
      }
    }

    iterations++;
  }

  // Filter out cards the user already has
  let filteredCards = cards;

  if (currentCardIds.length > 0) {
    // Find the highest-tier card the user already has
    let highestOwnedCardIndex = -1;

    for (let i = cards.length - 1; i >= 0; i--) {
      if (currentCardIds.includes(cards[i].cardId)) {
        highestOwnedCardIndex = i;
        break; // Found the highest tier card they own
      }
    }

    // If user has a card in the path, return only cards after that one
    if (highestOwnedCardIndex !== -1) {
      filteredCards = cards.slice(highestOwnedCardIndex + 1);
    }
  }

  // Build the upgrade path
  const upgradePath: UpgradePath = {
    cards: filteredCards,
    rewardPreference,
    startingCreditScore: initialCreditScore,
    endingCreditScore: currentCreditScore,
  };

  return upgradePath;
}
