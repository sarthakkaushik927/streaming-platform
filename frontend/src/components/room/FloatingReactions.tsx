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
            <span className="text-5xl md:text-6xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]">
              {item.emoji}
            </span>
            <span className="text-[10px] font-bold text-on-primary bg-primary/90 backdrop-blur-md px-3 py-0.5 rounded-full mt-1.5 border border-white/30 shadow-lg">
              {item.username}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
