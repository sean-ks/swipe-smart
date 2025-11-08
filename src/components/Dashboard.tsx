import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "./Logo";
import PixelCard from "./PixelCard";
import UserProfileCard from "./UserProfileCard";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  CreditCard,
  Trophy,
  Lightbulb,
  Map,
  Compass,
  Gift,
  Zap,
  Award,
  ExternalLink,
  Mail,
  Crown,
  TrendingUp,
} from "lucide-react";

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

export default function Dashboard({
  onNavigate,
}: DashboardProps) {
  const [showIdeasModal, setShowIdeasModal] = useState(false);
  const [showApplicationDialog, setShowApplicationDialog] =
    useState(false);
  const [showPendingCard, setShowPendingCard] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const [currentGoal, setCurrentGoal] = useState({
    name: "Chase Sapphire Preferred",
    type: "Travel Rewards",
    xpNeeded: 250,
    currentXp: 180,
  });

  const [pendingCard, setPendingCard] = useState<
    typeof currentGoal | null
  >(null);

  const inventory = [
    { name: "Discover it", type: "Cashback", color: "#FF6B35" },
    {
      name: "Capital One QuickSilver",
      type: "Cashback",
      color: "#004C97",
    },
  ];

  const creditTip =
    "Pay your balance in full each month to avoid interest charges and build a positive payment history.";

  const ideas = [
    {
      title: "Spending Insights",
      description:
        "Track your spending categories and get AI-powered suggestions",
    },
    {
      title: "Credit Score Simulator",
      description:
        "See how different actions affect your credit score",
    },
    {
      title: "Rewards Calculator",
      description:
        "Calculate potential rewards based on your spending",
    },
    {
      title: "Card Comparison Tool",
      description: "Compare multiple cards side-by-side",
    },
    {
      title: "Achievement Badges",
      description: "Earn badges for credit milestones",
    },
    {
      title: "Community Leaderboard",
      description: "See how you rank against other users",
    },
  ];

  const leaderboardData = [
    {
      rank: 1,
      name: "Sarah M.",
      level: 12,
      xp: 1840,
      cardStyle: {
        border: "border-purple-400",
        bg: "from-purple-600 to-purple-800",
      },
    },
    {
      rank: 2,
      name: "Michael K.",
      level: 10,
      xp: 1520,
      cardStyle: {
        border: "border-blue-400",
        bg: "from-blue-600 to-blue-800",
      },
    },
    {
      rank: 3,
      name: "You (John D.)",
      level: 5,
      xp: 180,
      cardStyle: {
        border: "border-yellow-400",
        bg: "from-yellow-600 to-yellow-800",
      },
      isCurrentUser: true,
    },
    {
      rank: 4,
      name: "Emily R.",
      level: 4,
      xp: 140,
      cardStyle: {
        border: "border-green-400",
        bg: "from-green-600 to-green-800",
      },
    },
    {
      rank: 5,
      name: "David L.",
      level: 3,
      xp: 95,
      cardStyle: {
        border: "border-gray-400",
        bg: "from-gray-600 to-gray-800",
      },
    },
  ];

  const handleFulfill = () => {
    // Open external link (simulated)
    window.open(
      "https://www.chase.com/personal/credit-cards/sapphire/preferred",
      "_blank",
    );

    // After a short delay, show the application dialog
    setTimeout(() => {
      setShowApplicationDialog(true);
    }, 1000);
  };

  const handleApplicationConfirm = (applied: boolean) => {
    if (applied) {
      // Move current goal to pending
      setPendingCard(currentGoal);
      setShowPendingCard(true);
      setHasApplied(true);

      // Set next goal
      setCurrentGoal({
        name: "Amex Gold Card",
        type: "Dining & Groceries",
        xpNeeded: 400,
        currentXp: 180,
      });
    }
    setShowApplicationDialog(false);
  };

  return (
    <div className="min-h-screen bg-[#4962bf] p-4 md:p-8 relative overflow-hidden">
      {/* Background animation */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-white/5"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header with User Profile Card */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Logo size={60} />
            <UserProfileCard
              level={5}
              xp={180}
              userName="John Doe"
            />
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => onNavigate("credit-route")}
              className="bg-white/20 border-2 border-white/40 text-white hover:bg-white/30 backdrop-blur-sm"
            >
              <Map className="w-4 h-4 mr-2" />
              Credit Route
            </Button>
            <Button
              onClick={() => onNavigate("explore")}
              className="bg-white/20 border-2 border-white/40 text-white hover:bg-white/30 backdrop-blur-sm"
            >
              <Compass className="w-4 h-4 mr-2" />
              Explore
            </Button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Next Credit Card Goal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-white/10 backdrop-blur-lg border-4 border-white/30 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-white" />
                <h2 className="text-white">
                  Next Credit Card Goal
                </h2>
              </div>
              <Button
                onClick={() => onNavigate("credit-route")}
                variant="ghost"
                className="text-white/80 hover:text-white text-sm"
              >
                View Route →
              </Button>
            </div>

            <div className="bg-white/10 p-6 rounded-xl border-2 border-white/20 relative overflow-hidden">
              {/* XP particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-300/60 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 0.8, 0.3],
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center gap-6 relative z-10">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <PixelCard
                    card={currentGoal}
                    size="large"
                    showGlow={true}
                  />
                </motion.div>

                <div className="flex-1">
                  <h3 className="text-white mb-2">
                    {currentGoal.name}
                  </h3>
                  <p className="text-white/70 mb-4">
                    {currentGoal.type}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-white text-sm">
                      <span>Progress</span>
                      <span>
                        {currentGoal.currentXp} /{" "}
                        {currentGoal.xpNeeded} XP
                      </span>
                    </div>
                    <div className="w-full h-4 bg-white/20 border-2 border-white/40 overflow-hidden relative">
                      <motion.div
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-200"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(currentGoal.currentXp / currentGoal.xpNeeded) * 100}%`,
                        }}
                        transition={{
                          duration: 1.5,
                          delay: 0.5,
                        }}
                      />
                      <motion.div
                        className="absolute inset-y-0 w-8 bg-white/40"
                        animate={{
                          x: ["0%", "400%"],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                      />
                    </div>
                    <p className="text-white/60 text-xs">
                      {currentGoal.xpNeeded -
                        currentGoal.currentXp}{" "}
                      XP until unlock!
                    </p>
                  </div>

                  <Button
                    onClick={handleFulfill}
                    className="mt-4 bg-white text-[#4962bf] hover:bg-white/90"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Fulfill - Apply Now
                  </Button>
                </div>
              </div>
            </div>

            {/* Pending Card Modal */}
            <AnimatePresence>
              {showPendingCard && pendingCard && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                    marginTop: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    marginTop: 24,
                  }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/5 p-6 rounded-xl border-2 border-white/10 opacity-60">
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="w-5 h-5 text-white/60" />
                      <h3 className="text-white/80">
                        Pending Card - Awaiting Arrival
                      </h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="opacity-50">
                        <PixelCard
                          card={pendingCard}
                          size="medium"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-white/70 text-sm">
                          {pendingCard.name}
                        </p>
                        <p className="text-white/50 text-xs mt-1">
                          Application submitted - Waiting for
                          card arrival
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Daily Tip & Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Credit Tip */}
            <div className="bg-white/10 backdrop-blur-lg border-4 border-white/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-6 h-6 text-yellow-300" />
                <h2 className="text-white">
                  Credit Tip of the Day
                </h2>
              </div>
              <p className="text-white/80 text-sm">
                {creditTip}
              </p>

              <Button
                onClick={() => setShowIdeasModal(true)}
                className="mt-4 w-full bg-white/20 border-2 border-white/40 text-white hover:bg-white/30"
              >
                <Gift className="w-4 h-4 mr-2" />
                Explore Ideas
              </Button>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white/10 backdrop-blur-lg border-4 border-white/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-yellow-300" />
                <h2 className="text-white">
                  Recent Achievements
                </h2>
              </div>
              <div className="space-y-2">
                {[
                  {
                    name: "First Card",
                    icon: "🎉",
                    color: "bg-blue-500/20 border-blue-400/40",
                  },
                  {
                    name: "XP Collector",
                    icon: "⚡",
                    color:
                      "bg-yellow-500/20 border-yellow-400/40",
                  },
                ].map((achievement) => (
                  <motion.div
                    key={achievement.name}
                    className={`${achievement.color} border-2 rounded-lg p-3 flex items-center gap-3`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="text-2xl">
                      {achievement.icon}
                    </span>
                    <span className="text-white text-sm">
                      {achievement.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Leaderboard & Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/10 backdrop-blur-lg border-4 border-white/30 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-6 h-6 text-yellow-300" />
              <h2 className="text-white">Leaderboard</h2>
            </div>

            <div className="space-y-3">
              {leaderboardData.map((entry, index) => (
                <motion.div
                  key={entry.rank}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className={`relative overflow-hidden rounded-lg ${entry.isCurrentUser ? "ring-2 ring-yellow-400" : ""}`}
                >
                  {/* Credit card styled row */}
                  <div
                    className={`bg-gradient-to-r ${entry.cardStyle.bg} border-2 ${entry.cardStyle.border} p-4 relative`}
                  >
                    {/* Pixelated overlay */}
                    <div
                      className="absolute inset-0 opacity-10"
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

                    {/* Content */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Rank badge */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            entry.rank === 1
                              ? "bg-yellow-400 text-yellow-900"
                              : entry.rank === 2
                                ? "bg-gray-300 text-gray-900"
                                : entry.rank === 3
                                  ? "bg-orange-400 text-orange-900"
                                  : "bg-white/30 text-white"
                          }`}
                        >
                          <span className="text-sm">
                            {entry.rank}
                          </span>
                        </div>

                        {/* User info */}
                        <div>
                          <p className="text-white">
                            {entry.name}
                          </p>
                          <p className="text-white/70 text-xs">
                            Level {entry.level}
                          </p>
                        </div>
                      </div>

                      {/* XP */}
                      <div className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full">
                        <Zap className="w-3 h-3 text-yellow-300" />
                        <span className="text-white text-sm">
                          {entry.xp}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Inventory */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg border-4 border-white/30 rounded-2xl p-6 shadow-2xl"
          >
            <h2 className="text-white mb-6">
              Your Card Inventory
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {inventory.map((card, index) => (
                <motion.div
                  key={card.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.5 + index * 0.1,
                    type: "spring",
                  }}
                  className="cursor-pointer"
                >
                  <PixelCard card={card} size="medium" />
                </motion.div>
              ))}
              {/* Empty slots */}
              {[...Array(2)].map((_, i) => (
                <motion.div
                  key={`empty-${i}`}
                  className="w-32 h-20 border-4 border-dashed border-white/20 rounded-lg flex items-center justify-center"
                  whileHover={{
                    borderColor: "rgba(255, 255, 255, 0.4)",
                  }}
                >
                  <span className="text-white/40 text-xs">
                    Empty Slot
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Ideas Modal */}
        <Dialog
          open={showIdeasModal}
          onOpenChange={setShowIdeasModal}
        >
          <DialogContent className="bg-[#4962bf] border-4 border-white/40 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                Feature Ideas
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {ideas.map((idea) => (
                <div
                  key={idea.title}
                  className="bg-white/10 p-4 rounded-lg border-2 border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <h3 className="text-white mb-2">
                    {idea.title}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {idea.description}
                  </p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Application Confirmation Dialog */}
        <AlertDialog
          open={showApplicationDialog}
          onOpenChange={setShowApplicationDialog}
        >
          <AlertDialogContent className="bg-[#4962bf] border-4 border-white/40">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                Did you apply for the card?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-white/80">
                We opened the application page in a new tab. Did
                you complete and submit your application?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => handleApplicationConfirm(false)}
                className="bg-white/20 border-white/40 text-white hover:bg-white/30"
              >
                No, not yet
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleApplicationConfirm(true)}
                className="bg-white text-[#4962bf] hover:bg-white/90"
              >
                Yes, I applied!
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}