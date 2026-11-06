import React, { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  message: string;
  action?: ReactNode;
}

// Styled like a dark, empty screen waiting for the show.
export const EmptyState: React.FC<EmptyStateProps> = ({ icon, message, action }) => (
  <div className="flex flex-col items-center justify-center gap-4 rounded-sm border-2 border-dashed border-line px-6 py-20 text-center">
    <span className="text-accent [&>svg]:size-9">{icon}</span>
    <p className="font-display text-3xl text-ink">{message}</p>
    {action}
  </div>
);
