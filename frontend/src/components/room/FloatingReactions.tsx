import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ReactionItem {
  id: string;
  emoji: string;
  username: string;
  leftPercent: number;
}

interface FloatingReactionsProps {
  reactions: ReactionItem[];
  onRemove: (id: string) => void;
}

export const FloatingReactions: React.FC<FloatingReactionsProps> = ({ reactions, onRemove }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      <AnimatePresence>
        {reactions.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20, scale: 0.3 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: [-10, -180, -320],
              scale: [0.4, 1.6, 1.2, 0.7],
              rotate: [0, -12, 12, 0],
            }}
            transition={{ duration: 3, ease: 'easeOut' }}
            onAnimationComplete={() => onRemove(item.id)}
            style={{ left: `${item.leftPercent}%` }}
            className="absolute bottom-10 -translate-x-1/2 flex flex-col items-center select-none"
          >
            <span className="text-5xl md:text-6xl">
              {item.emoji}
            </span>
            <span className="rounded-sm bg-marquee px-2 py-0.5 text-xs font-semibold text-marquee-ink">
              {item.username}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
