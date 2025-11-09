import { motion } from 'motion/react';
import Logo from './Logo';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#4962bf] flex items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-white/10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size={120} />
        </motion.div>

        {/* Pixelated loading bar */}
        <div className="w-64 h-4 bg-white/20 backdrop-blur-sm border-2 border-white/40 overflow-hidden">
          <motion.div
            className="h-full bg-white"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Loading text */}
        <motion.div
          className="text-white text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <p>Loading your credit journey...</p>
        </motion.div>
      </div>

      {/* Liquid glass effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 pointer-events-none" />
    </div>
  );
}
