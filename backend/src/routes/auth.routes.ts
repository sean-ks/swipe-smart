import { Router } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { prisma } from '../utils/prisma';
import { verifyToken, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Sign up endpoint
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Create user in Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return res.status(400).json({ error: authError?.message || 'Signup failed' });
    }

    // Create profile in database using Prisma
    const profile = await prisma.profile.create({
      data: {
        userId: authData.user.id,
      },
    });

    res.json({
      user: authData.user,
      session: authData.session,
      profile
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign in endpoint
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return res.status(400).json({ error: authError?.message || 'Invalid credentials' });
    }

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { userId: authData.user.id },
    });

    res.json({
      user: authData.user,
      session: authData.session,
      isNewUser: !profile
    });
  } catch (error) {
    console.error('Signin error:', error);
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
    const profile = await prisma.profile.update({
      where: { userId: req.userId },
      data: req.body,
    });

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
