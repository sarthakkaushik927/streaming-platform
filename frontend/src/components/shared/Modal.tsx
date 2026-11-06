import React, { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

const SIZES = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: keyof typeof SIZES;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/70"
        />
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className={`pointer-events-auto w-full ${SIZES[size]} overflow-hidden rounded-sm border border-line border-t-4 border-t-marquee bg-card shadow-[8px_8px_0_rgba(0,0,0,0.45)]`}
          >
            <div className="flex items-center justify-between border-b border-line py-2 pr-2 pl-6">
              <h2 className="text-2xl">{title}</h2>
              <IconButton label="Close" onClick={onClose}>
                <X className="size-4" />
              </IconButton>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);
