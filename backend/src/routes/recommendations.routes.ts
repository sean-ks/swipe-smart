import { Router } from 'express';
import { getRecommendations, getCardPath } from '../controllers/recommendations.controller';

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

export default router;
