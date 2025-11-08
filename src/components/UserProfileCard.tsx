import { useState } from 'react';
import { motion } from 'motion/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Settings, Zap } from 'lucide-react';

interface UserProfileCardProps {
  level: number;
  xp: number;
  userName?: string;
}

export default function UserProfileCard({ level, xp, userName = 'John Doe' }: UserProfileCardProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState('john@example.com');
  const [phone, setPhone] = useState('(555) 123-4567');
  const [notifications, setNotifications] = useState(true);

  // Unlock different borders and colors based on level
  const getLevelStyle = (level: number) => {
    if (level >= 10) return { border: 'border-purple-400', bg: 'from-purple-600 to-purple-800', glow: 'shadow-purple-500/50' };
    if (level >= 7) return { border: 'border-blue-400', bg: 'from-blue-600 to-blue-800', glow: 'shadow-blue-500/50' };
    if (level >= 5) return { border: 'border-yellow-400', bg: 'from-yellow-600 to-yellow-800', glow: 'shadow-yellow-500/50' };
    if (level >= 3) return { border: 'border-green-400', bg: 'from-green-600 to-green-800', glow: 'shadow-green-500/50' };
    return { border: 'border-gray-400', bg: 'from-gray-600 to-gray-800', glow: 'shadow-gray-500/50' };
  };

  const style = getLevelStyle(level);

  return (
    <>
      <motion.div
        className="cursor-pointer"
        whileHover={{ scale: 1.02 }}
        onClick={() => setShowSettings(true)}
      >
        {/* Credit Card Profile */}
        <div
          className={`h-24 bg-gradient-to-br ${style.bg} rounded-lg border-2 ${style.border} shadow-2xl ${style.glow} relative overflow-hidden`}
          style={{ width: '160px' }}
        >
          {/* Pixelated overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 3px,
                  rgba(255, 255, 255, 0.1) 3px,
                  rgba(255, 255, 255, 0.1) 4px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 3px,
                  rgba(255, 255, 255, 0.1) 3px,
                  rgba(255, 255, 255, 0.1) 4px
                )
              `,
            }}
          />

          {/* Liquid glass effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/20" />

          {/* Card Content */}
          <div className="relative z-10 p-2 h-full flex flex-col justify-center">
            {/* Top section */}
            <div className="flex justify-between items-start mb-1">
              <div>
                <p className="text-white/80 text-[8px]">MEMBER</p>
                <p className="text-white text-[10px]">Level {level}</p>
              </div>
              <Settings className="w-3 h-3 text-white/60" />
            </div>

            {/* Middle section - Name */}
            <div className="mb-1">
              <p className="text-white text-sm tracking-wide truncate">{name.toUpperCase()}</p>
            </div>

            {/* Bottom section - XP & Level indicator */}
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-0.5 text-yellow-300">
                <Zap className="w-3 h-3" />
                <span className="text-[10px]">{xp} XP</span>
              </div>
              <div className="text-white/60 text-[8px]">
                2024
              </div>
            </div>
          </div>

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        </div>
      </motion.div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="bg-[#4962bf] border-4 border-white/40 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Quick Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name" className="text-white mb-2 block">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/20 border-white/40 text-white placeholder:text-white/60"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-white mb-2 block">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/20 border-white/40 text-white placeholder:text-white/60"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-white mb-2 block">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white/20 border-white/40 text-white placeholder:text-white/60"
              />
            </div>

            <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg border-2 border-white/20">
              <Label htmlFor="notifications" className="text-white">Enable Notifications</Label>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <Button className="w-full bg-white text-[#4962bf] hover:bg-white/90">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
