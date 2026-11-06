import React, { InputHTMLAttributes, ReactNode, useId } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, error, hint, className = '', id, ...props }) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const noteId = `${inputId}-note`;
  const note = error ?? hint;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="label-caps block text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted [&>svg]:size-4">{icon}</span>}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={note ? noteId : undefined}
          className={`min-h-11 w-full rounded-sm border bg-canvas px-3 text-base text-ink transition-colors placeholder:text-muted/60 focus:border-accent focus:outline-none disabled:opacity-60 sm:text-sm ${icon ? 'pl-9' : ''} ${error ? 'border-danger' : 'border-line'} ${className}`}
          {...props}
        />
      </div>
      {note && (
        <p id={noteId} className={`text-sm ${error ? 'text-danger' : 'text-muted'}`}>
          {note}
        </p>
      )}
    </div>
  );
};
