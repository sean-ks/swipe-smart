import { useState } from 'react';
import { motion } from 'motion/react';
import Logo from './Logo';
import PixelCard from './PixelCard';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, Lock, Check, Star, Zap, Award } from 'lucide-react';

interface CreditRouteProps {
  onNavigate: (screen: string) => void;
}

interface CardNode {
  id: number;
  name: string;
  type: string;
  xpRequired: number;
  status: 'completed' | 'current' | 'locked';
  position: { x: number; y: number };
}

export default function CreditRoute({ onNavigate }: CreditRouteProps) {
  const [selectedCard, setSelectedCard] = useState<CardNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const cardNodes: CardNode[] = [
    { id: 1, name: 'Discover it', type: 'Starter', xpRequired: 0, status: 'completed', position: { x: 50, y: 85 } },
    { id: 2, name: 'Capital One QuickSilver', type: 'Cashback', xpRequired: 100, status: 'completed', position: { x: 30, y: 65 } },
    { id: 3, name: 'Chase Sapphire Preferred', type: 'Travel', xpRequired: 250, status: 'current', position: { x: 50, y: 50 } },
    { id: 4, name: 'Amex Gold Card', type: 'Dining', xpRequired: 400, status: 'locked', position: { x: 70, y: 35 } },
    { id: 5, name: 'Chase Sapphire Reserve', type: 'Premium Travel', xpRequired: 600, status: 'locked', position: { x: 50, y: 15 } },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-6 h-6 text-white" />;
      case 'current':
        return <Star className="w-6 h-6 text-yellow-300" />;
      case 'locked':
        return <Lock className="w-6 h-6 text-white/50" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/80 border-green-300';
      case 'current':
        return 'bg-yellow-500/80 border-yellow-300';
      case 'locked':
        return 'bg-white/20 border-white/40';
    }
  };

  return (
    <div className="min-h-screen bg-[#4962bf] p-4 md:p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-white/5"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => onNavigate('dashboard')}
              variant="ghost"
              className="text-white hover:text-white/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Logo size={60} />
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-white">180 XP</span>
              </div>
            </div>
            <h1 className="text-white">Your Credit Route</h1>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skill tree visualization */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg border-4 border-white/30 rounded-2xl p-8 shadow-2xl">
            <div className="relative h-[700px] bg-gradient-to-b from-white/5 to-transparent rounded-xl border-2 border-white/20 overflow-hidden">
              {/* Pixelated grid background */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(
                      0deg,
                      transparent,
                      transparent 20px,
                      rgba(255, 255, 255, 0.1) 20px,
                      rgba(255, 255, 255, 0.1) 21px
                    ),
                    repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 20px,
                      rgba(255, 255, 255, 0.1) 20px,
                      rgba(255, 255, 255, 0.1) 21px
                    )
                  `,
                }}
              />

              {/* Connection lines with pixelated effect */}
              <svg className="absolute inset-0 w-full h-full">
                {cardNodes.map((node, index) => {
                  if (index < cardNodes.length - 1) {
                    const nextNode = cardNodes[index + 1];
                    const isCompleted = node.status === 'completed' && nextNode.status !== 'locked';
                    return (
                      <g key={`line-${node.id}`}>
                        <motion.line
                          x1={`${node.position.x}%`}
                          y1={`${node.position.y}%`}
                          x2={`${nextNode.position.x}%`}
                          y2={`${nextNode.position.y}%`}
                          stroke={isCompleted ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255, 255, 255, 0.2)'}
                          strokeWidth="4"
                          strokeDasharray={node.status === 'locked' ? '8,8' : '0'}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1, delay: index * 0.2 }}
                        />
                        {/* Energy particles along the path */}
                        {isCompleted && (
                          <motion.circle
                            r="4"
                            fill="#22c55e"
                            initial={{
                              cx: `${node.position.x}%`,
                              cy: `${node.position.y}%`,
                            }}
                            animate={{
                              cx: [`${node.position.x}%`, `${nextNode.position.x}%`],
                              cy: [`${node.position.y}%`, `${nextNode.position.y}%`],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear',
                              delay: index * 0.5,
                            }}
                          />
                        )}
                      </g>
                    );
                  }
                  return null;
                })}
              </svg>

              {/* Card nodes */}
              {cardNodes.map((node, index) => (
                <motion.div
                  key={node.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{
                    left: `${node.position.x}%`,
                    top: `${node.position.y}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.2, type: 'spring', stiffness: 200 }}
                  onHoverStart={() => setHoveredNode(node.id)}
                  onHoverEnd={() => setHoveredNode(null)}
                  onClick={() => setSelectedCard(node)}
                >
                  {/* Node container */}
                  <div className="relative">
                    {/* Glow effect for current card */}
                    {node.status === 'current' && (
                      <motion.div
                        className="absolute -inset-6 bg-yellow-400/20 rounded-full blur-xl"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                    )}

                    {/* Main node with pixelated border */}
                    <motion.div
                      className={`relative w-28 h-28 ${getStatusColor(node.status)} backdrop-blur-sm border-4 rounded-xl flex flex-col items-center justify-center shadow-2xl overflow-hidden`}
                      whileHover={{ scale: 1.15 }}
                      animate={{
                        y: node.status === 'current' ? [0, -5, 0] : 0,
                      }}
                      transition={{
                        y: {
                          duration: 2,
                          repeat: Infinity,
                        },
                      }}
                    >
                      {/* Pixelated overlay */}
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          backgroundImage: `
                            repeating-linear-gradient(
                              0deg,
                              transparent,
                              transparent 4px,
                              rgba(255, 255, 255, 0.1) 4px,
                              rgba(255, 255, 255, 0.1) 5px
                            ),
                            repeating-linear-gradient(
                              90deg,
                              transparent,
                              transparent 4px,
                              rgba(255, 255, 255, 0.1) 4px,
                              rgba(255, 255, 255, 0.1) 5px
                            )
                          `,
                        }}
                      />

                      {getStatusIcon(node.status)}

                      {/* XP badge */}
                      <div className="mt-2 bg-black/30 px-2 py-0.5 rounded text-xs text-white flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {node.xpRequired}
                      </div>

                      {/* Particle effects for completed cards */}
                      {node.status === 'completed' && (
                        <>
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-green-300 rounded-full"
                              style={{
                                left: '50%',
                                top: '50%',
                              }}
                              animate={{
                                x: [0, (Math.random() - 0.5) * 40],
                                y: [0, (Math.random() - 0.5) * 40],
                                opacity: [1, 0],
                                scale: [1, 0],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.5,
                              }}
                            />
                          ))}
                        </>
                      )}

                      {/* Current card pulse */}
                      {node.status === 'current' && (
                        <motion.div
                          className="absolute inset-0 border-4 border-yellow-300 rounded-xl"
                          animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.8, 0, 0.8],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                          }}
                        />
                      )}
                    </motion.div>

                    {/* Card name label */}
                    <motion.div
                      className="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.2 + 0.3 }}
                    >
                      <div className="bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-lg px-3 py-1">
                        <p className="text-white text-sm text-center max-w-[140px] truncate">{node.name}</p>
                        <p className="text-white/60 text-xs text-center">{node.type}</p>
                      </div>
                    </motion.div>

                    {/* Hover info tooltip */}
                    {hoveredNode === node.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -top-16 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm border-2 border-white/40 rounded-lg px-3 py-2 whitespace-nowrap z-50"
                      >
                        <p className="text-white text-xs">Click to view details</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Overall XP progress indicator at bottom */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-sm p-4 rounded-lg border-2 border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-300" />
                    <span className="text-white">Overall Progress</span>
                  </div>
                  <span className="text-white">180 / 600 XP</span>
                </div>
                <div className="w-full h-3 bg-white/20 border-2 border-white/40 overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-yellow-200"
                    initial={{ width: 0 }}
                    animate={{ width: '30%' }}
                    transition={{ duration: 1.5, delay: 1 }}
                  />
                  {/* Pixelated overlay on progress bar */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: `
                        repeating-linear-gradient(
                          90deg,
                          transparent,
                          transparent 4px,
                          rgba(0, 0, 0, 0.2) 4px,
                          rgba(0, 0, 0, 0.2) 5px
                        )
                      `,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card details sidebar */}
          <div className="bg-white/10 backdrop-blur-lg border-4 border-white/30 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-white mb-6">Card Details</h2>

            {selectedCard ? (
              <motion.div
                key={selectedCard.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Card preview */}
                <div className="flex justify-center mb-4">
                  <PixelCard 
                    card={selectedCard} 
                    size="large"
                    showGlow={selectedCard.status === 'current'}
                  />
                </div>

                <div className="bg-white/10 p-4 rounded-lg border-2 border-white/20">
                  <h3 className="text-white mb-2">{selectedCard.name}</h3>
                  <Badge className="bg-white/20 text-white border-white/40 mb-4">
                    {selectedCard.type}
                  </Badge>

                  <div className="space-y-2">
                    <div className="flex justify-between text-white text-sm">
                      <span>Status</span>
                      <Badge className={
                        selectedCard.status === 'completed' ? 'bg-green-500/80 text-white' :
                        selectedCard.status === 'current' ? 'bg-yellow-500/80 text-white' :
                        'bg-white/20 text-white/60'
                      }>
                        {selectedCard.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-white text-sm">
                      <span>XP Required</span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-yellow-300" />
                        {selectedCard.xpRequired}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 p-4 rounded-lg border-2 border-white/20">
                  <h4 className="text-white mb-3">Benefits</h4>
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li>• 2x points on travel & dining</li>
                    <li>• $50 annual travel credit</li>
                    <li>• No foreign transaction fees</li>
                    <li>• Transfer points to partners</li>
                  </ul>
                </div>

                <div className="bg-white/10 p-4 rounded-lg border-2 border-white/20">
                  <h4 className="text-white mb-3">Requirements</h4>
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li>• Good credit score (670+)</li>
                    <li>• 2+ years credit history</li>
                    <li>• Low credit utilization</li>
                  </ul>
                </div>

                {selectedCard.status === 'current' && (
                  <Button className="w-full bg-white text-[#4962bf] hover:bg-white/90">
                    <Zap className="w-4 h-4 mr-2" />
                    Learn How to Earn XP
                  </Button>
                )}

                {selectedCard.status === 'completed' && (
                  <div className="bg-green-500/20 border-2 border-green-300/40 p-3 rounded-lg flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-300" />
                    <p className="text-white text-sm">Completed!</p>
                  </div>
                )}

                {selectedCard.status === 'locked' && (
                  <div className="bg-white/5 border-2 border-white/20 p-3 rounded-lg flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-white/50" />
                    <p className="text-white/70 text-sm">Complete previous cards to unlock</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <Award className="w-16 h-16 text-white/40 mx-auto mb-4" />
                </motion.div>
                <p className="text-white/70">Click on a card node to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
