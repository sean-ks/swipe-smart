import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { verifyToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Create profile for new user (called after Supabase signup)
router.post('/create-profile', async (req, res) => {
  try {
    const {
      id,
      email,
      firstName,
      lastName,
      phone,
      creditHistoryAge,
      creditScore,
      knowsCreditScore,
      travelGoal,
      diningGoal,
      buildCreditGoal,
      cashbackGoal,
      onlineShoppingGoal
    } = req.body;

    // DEBUG: Log full request body to diagnose NULL values issue
    console.log('==================== CREATE PROFILE DEBUG ====================');
    console.log('FULL REQUEST BODY:', JSON.stringify(req.body, null, 2));
    console.log('==============================================================');

    console.log('Create profile request received:', { id, email });

    // Validation
    if (!id || !email) {
      console.error('Missing required fields:', { id, email });
      return res.status(400).json({
        error: 'Missing required fields: id, email'
      });
    }

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: id }
    });

    if (existingProfile) {
      console.log('Profile already exists for user:', id);
      return res.json({
        message: 'Profile already exists',
        profile: existingProfile,
        isNewUser: false
      });
    }

    // Create new profile with ALL data at once
    const newProfile = await prisma.profile.create({
      data: {
        userId: id,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        creditHistoryAge: creditHistoryAge || null,
        creditScore: creditScore || null,
        knowsCreditScore: knowsCreditScore || null,
        travelGoal: travelGoal || null,
        diningGoal: diningGoal || null,
        buildCreditGoal: buildCreditGoal || null,
        cashbackGoal: cashbackGoal || null,
        onlineShoppingGoal: onlineShoppingGoal || null,
      }
    });

    console.log('Profile created successfully with full data:', newProfile.userId);

    return res.status(201).json({
      message: 'Profile created successfully',
      profile: newProfile,
      isNewUser: true
    });
  } catch (error: any) {
    console.error('Error creating profile:', error);

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'A profile with this ID already exists'
      });
    }

    // Handle invalid UUID format
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Invalid user ID format'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get profile (protected)
router.get('/profile', verifyToken, async (req: AuthRequest, res) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId }
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

// Update profile (protected)
router.put('/profile', verifyToken, async (req: AuthRequest, res) => {
  try {
    const profile = await prisma.profile.upsert({
      where: { userId: req.userId },
      update: req.body,
      create: {
        userId: req.userId!,
        ...req.body,
      }
    });

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
