import { Request, Response } from 'express';
import { getTopCardRecommendations } from '../services/recommendations/cardRecommendations';
import { generateCardPath } from '../services/recommendations/cardPath';
import { generateUpgradePath } from '../services/recommendations/upgradePath';
import { CardRecommendationInput, PathGenerationInput, UpgradePathInput } from '../services/recommendations/types';
import { RewardType, Category } from '../../../generated/prisma';

/**
 * POST /api/recommendations
 * Get top credit card recommendations
 */
export async function getRecommendations(req: Request, res: Response) {
  try {
    const {
      rewardPreference,
      userCreditScore,
      creditHistoryYears,
      lifetimeSpendingByCategory,
      limit = 10,
    } = req.body;

    // Validation
    if (!rewardPreference || !['CASHBACK', 'TRAVEL', 'MISCELLANEOUS'].includes(rewardPreference)) {
      return res.status(400).json({
        error: 'Invalid or missing rewardPreference. Must be CASHBACK, TRAVEL, or MISCELLANEOUS',
      });
    }

    if (typeof userCreditScore !== 'number' || userCreditScore < 300 || userCreditScore > 850) {
      return res.status(400).json({
        error: 'Invalid userCreditScore. Must be a number between 300 and 850',
      });
    }

    if (typeof creditHistoryYears !== 'number' || creditHistoryYears < 0) {
      return res.status(400).json({
        error: 'Invalid creditHistoryYears. Must be a non-negative number',
      });
    }

    if (!lifetimeSpendingByCategory || typeof lifetimeSpendingByCategory !== 'object') {
      return res.status(400).json({
        error: 'Invalid lifetimeSpendingByCategory. Must be an object mapping categories to amounts',
      });
    }

    if (typeof limit !== 'number' || limit < 1 || limit > 50) {
      return res.status(400).json({
        error: 'Invalid limit. Must be a number between 1 and 50',
      });
    }

    // Prepare input
    const input: CardRecommendationInput = {
      rewardPreference: rewardPreference as RewardType,
      userCreditScore,
      creditHistoryYears,
      lifetimeSpendingByCategory: lifetimeSpendingByCategory as Partial<Record<Category, number>>,
      limit,
    };

    // Get recommendations
    const recommendations = await getTopCardRecommendations(input);

    // Return results
    return res.status(200).json({
      success: true,
      data: recommendations,
      meta: {
        count: recommendations.length,
        requestedLimit: limit,
      },
    });
  } catch (error) {
    console.error('Error getting card recommendations:', error);
    return res.status(500).json({
      error: 'Internal server error while getting recommendations',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/recommendations/path
 * Generate a credit card progression path
 */
export async function getCardPath(req: Request, res: Response) {
  try {
    const {
      rewardPreference,
      userCreditScore,
      creditHistoryYears,
      lifetimeSpendingByCategory,
      selectedCardId,
      testMode = false,
    } = req.body;

    // Validation
    if (!rewardPreference || !['CASHBACK', 'TRAVEL', 'MISCELLANEOUS'].includes(rewardPreference)) {
      return res.status(400).json({
        error: 'Invalid or missing rewardPreference. Must be CASHBACK, TRAVEL, or MISCELLANEOUS',
      });
    }

    if (typeof userCreditScore !== 'number' || userCreditScore < 300 || userCreditScore > 850) {
      return res.status(400).json({
        error: 'Invalid userCreditScore. Must be a number between 300 and 850',
      });
    }

    if (typeof creditHistoryYears !== 'number' || creditHistoryYears < 0) {
      return res.status(400).json({
        error: 'Invalid creditHistoryYears. Must be a non-negative number',
      });
    }

    if (!lifetimeSpendingByCategory || typeof lifetimeSpendingByCategory !== 'object') {
      return res.status(400).json({
        error: 'Invalid lifetimeSpendingByCategory. Must be an object mapping categories to amounts',
      });
    }

    if (!selectedCardId || typeof selectedCardId !== 'string') {
      return res.status(400).json({
        error: 'Invalid or missing selectedCardId. Must be a string',
      });
    }

    // Prepare input
    const input: PathGenerationInput = {
      rewardPreference: rewardPreference as RewardType,
      userCreditScore,
      creditHistoryYears,
      lifetimeSpendingByCategory: lifetimeSpendingByCategory as Partial<Record<Category, number>>,
      selectedCardId,
      testMode,
    };

    // Generate card path
    const path = await generateCardPath(input);

    // Return results
    return res.status(200).json({
      success: true,
      data: path,
      meta: {
        totalSteps: path.steps.length,
        totalDurationYears: path.totalDurationYears,
        creditScoreChange: path.finalCreditScore - userCreditScore,
      },
    });
  } catch (error) {
    console.error('Error generating card path:', error);
    return res.status(500).json({
      error: 'Internal server error while generating card path',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/recommendations/upgrade-path
 * Generate a simplified upgrade path showing card progression from starter to premium
 */
export async function getUpgradePath(req: Request, res: Response) {
  try {
    const {
      rewardPreference,
      userCreditScore,
      creditHistoryYears,
      lifetimeSpendingByCategory,
      currentCardIds = [],
      testMode = false,
    } = req.body;

    // Validation
    if (!rewardPreference || !['CASHBACK', 'TRAVEL', 'MISCELLANEOUS'].includes(rewardPreference)) {
      return res.status(400).json({
        error: 'Invalid or missing rewardPreference. Must be CASHBACK, TRAVEL, or MISCELLANEOUS',
      });
    }

    if (typeof userCreditScore !== 'number' || userCreditScore < 300 || userCreditScore > 850) {
      return res.status(400).json({
        error: 'Invalid userCreditScore. Must be a number between 300 and 850',
      });
    }

    if (typeof creditHistoryYears !== 'number' || creditHistoryYears < 0) {
      return res.status(400).json({
        error: 'Invalid creditHistoryYears. Must be a non-negative number',
      });
    }

    if (!lifetimeSpendingByCategory || typeof lifetimeSpendingByCategory !== 'object') {
      return res.status(400).json({
        error: 'Invalid lifetimeSpendingByCategory. Must be an object mapping categories to amounts',
      });
    }

    if (!Array.isArray(currentCardIds)) {
      return res.status(400).json({
        error: 'Invalid currentCardIds. Must be an array of card IDs',
      });
    }

    // Prepare input
    const input: UpgradePathInput = {
      rewardPreference: rewardPreference as RewardType,
      userCreditScore,
      creditHistoryYears,
      lifetimeSpendingByCategory: lifetimeSpendingByCategory as Partial<Record<Category, number>>,
      currentCardIds,
      testMode,
    };

    // Generate upgrade path
    const upgradePath = await generateUpgradePath(input);

    // Return only card names as a simple list
    const cardNames = upgradePath.cards.map(card => card.cardName);

    return res.status(200).json(cardNames);
  } catch (error) {
    console.error('Error generating upgrade path:', error);
    return res.status(500).json({
      error: 'Internal server error while generating upgrade path',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
