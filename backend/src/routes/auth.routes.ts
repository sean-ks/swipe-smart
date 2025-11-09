import { Router } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { prisma } from '../utils/prisma';
import { verifyToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Create profile for newly signed up user
router.post('/create-profile', verifyToken, async (req: AuthRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if profile already exists
    const existing = await prisma.profile.findUnique({
      where: { userId: req.userId },
    });

    if (existing) {
      return res.json({ profile: existing, created: false });
    }

    // Create new profile
    const profile = await prisma.profile.create({
      data: {
        userId: req.userId,
      },
    });

    res.json({ profile, created: true });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get profile endpoint
router.get('/profile', verifyToken, async (req: AuthRequest, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile endpoint
router.put('/profile', verifyToken, async (req: AuthRequest, res) => {
  try {
    const profile = await prisma.profile.upsert({
      where: { userId: req.userId },
      update: req.body,
      create: {
        userId: req.userId!,
        ...req.body,
      },
    });

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
