import React from 'react';
import { Loader2 } from 'lucide-react';

const SIZES = { sm: 'size-4', md: 'size-8', lg: 'size-12' };

export const LoadingSpinner: React.FC<{ size?: keyof typeof SIZES }> = ({ size = 'md' }) => (
  <div role="status" aria-label="Loading" className="flex items-center justify-center">
    <Loader2 className={`${SIZES[size]} animate-spin text-accent`} />
  </div>
);
