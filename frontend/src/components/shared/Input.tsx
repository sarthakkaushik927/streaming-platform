import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="font-label-caps text-[12px] text-on-surface-variant flex items-center gap-2 uppercase tracking-widest">
          {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          className={`w-full bg-surface-container-low border ${error ? 'border-error' : 'border-outline'} rounded-xl px-4 py-3 font-label-mono text-[14px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-error text-[12px] font-label-mono mt-1">{error}</p>}
    </div>
  );
};
