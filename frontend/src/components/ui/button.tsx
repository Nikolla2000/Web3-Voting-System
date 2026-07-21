import Link from 'next/link';
import { type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  type?: 'button' | 'submit';
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_8px_24px_-8px_rgba(79,70,229,0.55)] hover:shadow-[0_10px_28px_-6px_rgba(79,70,229,0.65)] hover:-translate-y-0.5',
  secondary:
    'bg-white text-slate-800 border border-slate-200 hover:border-indigo-300 hover:-translate-y-0.5 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)]',
  ghost: 'text-slate-600 hover:text-slate-900',
};

export function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}