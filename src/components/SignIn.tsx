import { useState } from 'react';
import { motion } from 'motion/react';
import Logo from './Logo';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SignInProps {
  onNavigate: (screen: string) => void;
}

export default function SignIn({ onNavigate }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('dashboard');
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

          <form onSubmit={handleSignIn} className="space-y-6">
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
            >
              Sign In
            </Button>
          </form>

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
