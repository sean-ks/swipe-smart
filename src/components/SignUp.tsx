import { useState } from 'react';
import { motion } from 'motion/react';
import Logo from './Logo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SignUpProps {
  onNavigate: (screen: string) => void;
}

export default function SignUp({ onNavigate }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('signup-flow');
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

      {/* Sign up form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg border-4 border-white/30 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center mb-8">
            <Logo size={80} />
          </div>

          <h1 className="text-white text-center mb-8">Sign Up</h1>

          <form onSubmit={handleSignUp} className="space-y-6">
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

            <div>
              <Label htmlFor="confirmPassword" className="text-white mb-2 block">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white/20 border-white/40 text-white placeholder:text-white/60"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-[#4962bf] hover:bg-white/90"
            >
              Sign Up
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/80">Already have an account?</p>
            <button
              onClick={() => onNavigate('signin')}
              className="text-white underline hover:text-white/80 mt-2"
            >
              Sign In
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
