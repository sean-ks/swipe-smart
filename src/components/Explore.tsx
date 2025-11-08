import { useState } from 'react';
import { motion } from 'motion/react';
import Logo from './Logo';
import PixelCard from './PixelCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { ArrowLeft, Search, Filter } from 'lucide-react';

interface ExploreProps {
  onNavigate: (screen: string) => void;
}

export default function Explore({ onNavigate }: ExploreProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [creditScoreFilter, setCreditScoreFilter] = useState([300, 850]);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const creditCards = [
    { name: 'Chase Sapphire Preferred', type: 'Travel Rewards', color: '#003087', creditScore: 690, category: 'travel' },
    { name: 'Discover it Cashback', type: 'Cashback', color: '#FF6B35', creditScore: 640, category: 'cashback' },
    { name: 'Amex Gold Card', type: 'Dining & Groceries', color: '#006FCF', creditScore: 700, category: 'dining' },
    { name: 'Capital One Venture', type: 'Travel', color: '#004C97', creditScore: 690, category: 'travel' },
    { name: 'Citi Double Cash', type: 'Cashback', color: '#056DAE', creditScore: 650, category: 'cashback' },
    { name: 'Chase Freedom Unlimited', type: 'Cashback', color: '#003087', creditScore: 670, category: 'cashback' },
    { name: 'Amex Platinum', type: 'Premium Travel', color: '#006FCF', creditScore: 720, category: 'travel' },
    { name: 'Capital One QuickSilver', type: 'Cashback', color: '#004C97', creditScore: 640, category: 'cashback' },
  ];

  const creditRoutes = [
    { name: 'Travel Enthusiast Route', cards: 4, estimatedTime: '18 months', focus: 'Maximize travel rewards' },
    { name: 'Cashback Master Route', cards: 3, estimatedTime: '12 months', focus: 'Optimize cashback earnings' },
    { name: 'Credit Builder Route', cards: 5, estimatedTime: '24 months', focus: 'Build credit from scratch' },
    { name: 'Premium Rewards Route', cards: 4, estimatedTime: '30 months', focus: 'High-end rewards cards' },
  ];

  const filteredCards = creditCards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         card.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesScore = card.creditScore >= creditScoreFilter[0] && card.creditScore <= creditScoreFilter[1];
    const matchesCategory = categoryFilter === 'all' || card.category === categoryFilter;
    return matchesSearch && matchesScore && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#4962bf] p-4 md:p-8 relative overflow-hidden">
      {/* Animated background */}
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
              y: [0, -20, 0],
              opacity: [0.05, 0.1, 0.05],
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
          <h1 className="text-white">Explore</h1>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cards" className="space-y-6">
          <TabsList className="bg-white/10 border-2 border-white/30">
            <TabsTrigger value="cards" className="data-[state=active]:bg-white data-[state=active]:text-[#4962bf]">
              Credit Cards
            </TabsTrigger>
            <TabsTrigger value="routes" className="data-[state=active]:bg-white data-[state=active]:text-[#4962bf]">
              Credit Routes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-6">
            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-lg border-4 border-white/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Filter className="w-5 h-5 text-white" />
                <h2 className="text-white">Filters</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Search */}
                <div>
                  <label className="text-white text-sm mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/20 border-white/40 text-white placeholder:text-white/60"
                      placeholder="Search cards..."
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-white text-sm mb-2 block">Category</label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="bg-white/20 border-white/40 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="cashback">Cashback</SelectItem>
                      <SelectItem value="dining">Dining</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Credit Score Range */}
                <div>
                  <label className="text-white text-sm mb-2 block">
                    Credit Score Range: {creditScoreFilter[0]} - {creditScoreFilter[1]}
                  </label>
                  <Slider
                    value={creditScoreFilter}
                    onValueChange={setCreditScoreFilter}
                    min={300}
                    max={850}
                    step={10}
                    className="mt-4"
                  />
                </div>
              </div>
            </div>

            {/* Cards Grid */}
            <div className="bg-white/10 backdrop-blur-lg border-4 border-white/30 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-white mb-6">Available Cards ({filteredCards.length})</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredCards.map((card, index) => (
                  <motion.div
                    key={card.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group cursor-pointer"
                  >
                    <PixelCard card={card} size="medium" />
                    <div className="mt-3 space-y-1">
                      <p className="text-white text-sm">{card.name}</p>
                      <p className="text-white/60 text-xs">{card.type}</p>
                      <p className="text-white/60 text-xs">Min Score: {card.creditScore}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredCards.length === 0 && (
                <div className="text-center py-12 text-white/70">
                  No cards match your filters. Try adjusting your search criteria.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="routes" className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg border-4 border-white/30 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-white mb-6">Recommended Credit Routes</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {creditRoutes.map((route, index) => (
                  <motion.div
                    key={route.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/10 p-6 rounded-xl border-2 border-white/20 hover:bg-white/20 transition-colors cursor-pointer group"
                  >
                    <h3 className="text-white mb-4">{route.name}</h3>

                    <div className="space-y-3">
                      <div className="flex justify-between text-white/70 text-sm">
                        <span>Number of Cards</span>
                        <span>{route.cards}</span>
                      </div>
                      <div className="flex justify-between text-white/70 text-sm">
                        <span>Estimated Time</span>
                        <span>{route.estimatedTime}</span>
                      </div>
                      <div className="text-white/70 text-sm">
                        <p className="mb-1">Focus:</p>
                        <p className="text-white">{route.focus}</p>
                      </div>
                    </div>

                    <Button className="w-full mt-6 bg-white text-[#4962bf] hover:bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                      Select This Route
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Route Comparison */}
            <div className="bg-white/10 backdrop-blur-lg border-4 border-white/30 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-white mb-6">Compare Routes</h2>
              <p className="text-white/70 text-center py-8">
                Select up to 3 routes to compare side-by-side
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
