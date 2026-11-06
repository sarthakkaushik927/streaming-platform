export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'marquee' | 'curtain-outline' | 'curtain-ghost';

// Square, printed-looking buttons. The primary one carries a red offset like a misregistered poster print.
const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-4 text-sm font-semibold tracking-wide transition-[transform,background-color,color,border-color,box-shadow] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-ink shadow-[3px_3px_0_var(--curtain)] hover:-translate-y-px hover:shadow-[4px_4px_0_var(--curtain)] active:shadow-[1px_1px_0_var(--curtain)]',
  outline: 'border border-ink/35 text-ink hover:border-accent hover:text-accent',
  ghost: 'text-ink hover:bg-subtle',
  danger: 'border border-danger/60 text-danger hover:border-curtain hover:bg-curtain hover:text-curtain-ink',
  // Same yellow in both themes, for use on the red curtain where the themed accent would vanish.
  marquee: 'bg-marquee text-marquee-ink shadow-[3px_3px_0_#0e0b08] hover:-translate-y-px hover:shadow-[4px_4px_0_#0e0b08]',
  // The secondary button on the red curtain.
  'curtain-outline': 'border border-curtain-ink/60 text-curtain-ink hover:bg-curtain-ink hover:text-curtain',
  'curtain-ghost': 'text-curtain-ink hover:bg-black/20',
};

export const buttonClasses = (variant: ButtonVariant = 'primary', fullWidth = false, className = ''): string =>
  [BASE, VARIANTS[variant], fullWidth ? 'w-full' : '', className].filter(Boolean).join(' ');
