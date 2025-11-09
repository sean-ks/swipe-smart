import { useState } from 'react';
import { motion } from 'motion/react';
import Logo from './Logo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface SignInProps {
  onNavigate: (screen: string) => void;
}

import { api } from '../lib/api';

export default function SignIn({ onNavigate }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithGoogle } = useAuth();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { user, session, isNewUser } = await api.auth.signIn({ email, password });
      
      // Set the session in Supabase client for auth state
      if (session) {
        await supabase.auth.setSession(session);
      }
      
      if (isNewUser) {
        onNavigate('signup-flow');
      } else {
        onNavigate('dashboard');
      }
    } catch (error) {
      console.error('Email signin error:', error);
      setError(error instanceof Error ? error.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    const { error } = await signInWithGoogle();

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#4962bf] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 bg-white/5 backdrop-blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25],
              rotate: [0, 360],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>

      {/* Sign in form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg border-4 border-white/30 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-8">
            <Logo size={80} />
          </div>

          <h1 className="text-white text-center mb-8">Sign In</h1>

          {error && (
            <div className="bg-red-500/20 border-2 border-red-500/50 rounded-lg p-3 mb-4">
              <p className="text-white text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleEmailSignIn} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white mb-2 block">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 border-white/40 text-white placeholder:text-white/60"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white mb-2 block">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/20 border-white/40 text-white placeholder:text-white/60"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-[#4962bf] hover:bg-white/90"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-white/70" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-[#4962bf] hover:bg-white/90 flex items-center justify-center gap-2"
            disabled={loading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>

          <div className="mt-6 text-center">
            <p className="text-white/80">Don't have an account?</p>
            <button
              onClick={() => onNavigate('signup')}
              className="text-white underline hover:text-white/80 mt-2"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Dev bypass */}
        <div className="mt-4 flex gap-2 flex-wrap justify-center">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs text-white/50 hover:text-white/80 underline"
          >
            → Dashboard
          </button>
          <button
            onClick={() => onNavigate('credit-route')}
            className="text-xs text-white/50 hover:text-white/80 underline"
          >
            → Credit Route
          </button>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs text-white/50 hover:text-white/80 underline"
          >
            → Explore
          </button>
        </div>
      </motion.div>
    </div>
  );
}
