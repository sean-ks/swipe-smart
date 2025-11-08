import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PixelCardProps {
  card: {
    name: string;
    type: string;
    color?: string;
    image?: string;
  };
  size?: 'small' | 'medium' | 'large';
  showGlow?: boolean;
}

export default function PixelCard({ card, size = 'medium', showGlow = false }: PixelCardProps) {
  const sizes = {
    small: { container: 'w-20 h-12', text: 'text-[6px]', nameText: 'text-[8px]' },
    medium: { container: 'w-32 h-20', text: 'text-[8px]', nameText: 'text-xs' },
    large: { container: 'w-48 h-32', text: 'text-xs', nameText: 'text-sm' },
  };

  const cardImages: { [key: string]: string } = {
    'Chase Sapphire Preferred': 'https://images.unsplash.com/photo-1726066012593-3175a0c4e9b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibHVlJTIwY3JlZGl0JTIwY2FyZHxlbnwxfHx8fDE3NjI2MjQ0OTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'Discover it': 'https://images.unsplash.com/photo-1736901217584-288ee5b71cf8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVkaXQlMjBjYXJkJTIwY2xvc2UlMjB1cHxlbnwxfHx8fDE3NjI2MjQ0OTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'Amex Gold Card': 'https://images.unsplash.com/photo-1648161235879-d2ba122f9ad9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkJTIwY3JlZGl0JTIwY2FyZHxlbnwxfHx8fDE3NjI2MjQ0OTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'Amex Platinum': 'https://images.unsplash.com/photo-1718670013921-2f144aba173a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbGF0aW51bSUyMGNhcmQlMjBsdXh1cnl8ZW58MXx8fHwxNzYyNjI0NDkxfDA&ixlib=rb-4.1.0&q=80&w=1080',
  };

  const cardImage = card.image || cardImages[card.name] || cardImages['Discover it'];
  const cardColor = card.color || '#4962bf';

  return (
    <motion.div
      className={`${sizes[size].container} relative`}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      {/* Glow effect for current card */}
      {showGlow && (
        <motion.div
          className="absolute -inset-2 bg-yellow-400/30 rounded-lg blur-xl"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}

      {/* Card container with pixelated image */}
      <div className="relative w-full h-full border-4 border-white/40 backdrop-blur-sm shadow-2xl overflow-hidden rounded-lg">
        {/* Pixelated background image */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src={cardImage}
            alt={card.name}
            className="w-full h-full object-cover"
            style={{
              imageRendering: 'pixelated',
              filter: 'contrast(1.1) saturate(1.2)',
            }}
          />
          {/* Color overlay to tint the image */}
          <div
            className="absolute inset-0 mix-blend-overlay opacity-60"
            style={{ background: `linear-gradient(135deg, ${cardColor}88 0%, ${cardColor}dd 100%)` }}
          />
        </div>

        {/* Pixelated grid overlay */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 3px,
                rgba(255, 255, 255, 0.15) 3px,
                rgba(255, 255, 255, 0.15) 4px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 3px,
                rgba(255, 255, 255, 0.15) 3px,
                rgba(255, 255, 255, 0.15) 4px
              )
            `,
          }}
        />

        {/* Liquid glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/20 pointer-events-none" />

        {/* Card content */}
        <div className="relative z-10 p-2 flex flex-col justify-between h-full">
          <div className={`${sizes[size].text} text-white/90 drop-shadow-lg px-1 py-0.5 bg-black/30 rounded inline-block self-start backdrop-blur-sm`}>
            {card.type}
          </div>
          {size !== 'small' && (
            <div className={`${sizes[size].nameText} text-white drop-shadow-lg`}>
              {card.name}
            </div>
          )}
        </div>

        {/* Subtle hover shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent pointer-events-none"
          whileHover={{
            background: [
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 50%, transparent 100%)',
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0) 50%, transparent 100%)',
            ],
          }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </motion.div>
  );
}
