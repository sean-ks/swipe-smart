import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendations.controller';

const router = Router();

/**
 * POST /api/recommendations
 * Get top credit card recommendations based on user preferences and spending
 */
router.post('/', getRecommendations);

export default router;
