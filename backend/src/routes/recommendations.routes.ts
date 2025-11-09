import { Router } from 'express';
import { getRecommendations, getCardPath, getUpgradePath } from '../controllers/recommendations.controller';

const router = Router();

/**
 * POST /api/recommendations
 * Get top credit card recommendations based on user preferences and spending
 */
router.post('/', getRecommendations);

/**
 * POST /api/recommendations/path
 * Generate a credit card progression path based on selected card and credit improvement
 */
router.post('/path', getCardPath);

/**
 * POST /api/recommendations/upgrade-path
 * Generate a simplified upgrade path showing card progression from starter to premium
 */
router.post('/upgrade-path', getUpgradePath);

export default router;
