import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface TicketProps {
  children: ReactNode;
  stub: ReactNode;
  stubPosition?: 'top' | 'bottom';
  /** Lifts and tilts with a red print shadow on hover. Off for tickets that hold a form, like sign-in. */
  interactive?: boolean;
  className?: string;
}

/*
  A cinema ticket: notches cut into both sides where the stub tears off, with a dashed perforation between.
  The stub row is a fixed 4.25rem so it lines up with the notches set in index.css.
  The outer wrapper is not masked, so its drop shadow follows the ticket's cut-out shape.
*/
export const Ticket: React.FC<TicketProps> = ({ children, stub, stubPosition = 'bottom', interactive = true, className = '' }) => {
  const stubRow = <div className="flex h-17 shrink-0 items-center px-5">{stub}</div>;

  return (
    <motion.div
      className={`h-full ${interactive ? 'transition-[filter] duration-200 hover:drop-shadow-[5px_5px_0_var(--curtain)]' : 'drop-shadow-[6px_6px_0_rgba(0,0,0,0.35)]'}`}
      whileHover={interactive ? { y: -6, rotate: -0.8 } : undefined}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      <div className={`ticket flex h-full flex-col ${stubPosition === 'top' ? 'ticket-stub-top' : ''} ${className}`}>
        {stubPosition === 'top' && stubRow}
        {stubPosition === 'top' && <div aria-hidden="true" className="perforation mx-5" />}
        <div className="flex-1 p-5">{children}</div>
        {stubPosition === 'bottom' && <div aria-hidden="true" className="perforation mx-5" />}
        {stubPosition === 'bottom' && stubRow}
      </div>
    </motion.div>
  );
};
