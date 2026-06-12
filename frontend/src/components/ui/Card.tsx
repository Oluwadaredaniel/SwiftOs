'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
}

export const Card = ({ children, className = '', onClick, glow }: CardProps) => (
  <div
    onClick={onClick}
    className={`bg-[var(--surface)] border border-[var(--border)] rounded-xl ${glow ? 'glow-accent' : ''} ${onClick ? 'cursor-pointer active:opacity-80 transition-opacity' : ''} ${className}`}
  >
    {children}
  </div>
);

export const BalanceCard = ({
  label,
  amount,
  currency,
  subtext,
  variant = 'default',
}: {
  label: string;
  amount: string;
  currency: string;
  subtext?: string;
  variant?: 'default' | 'premium' | 'success' | 'large';
}) => {
  if (variant === 'large') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-5"
      >
        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
          {label}
        </p>
        <p className="text-[40px] font-mono-num font-bold text-[var(--text-primary)] leading-none tracking-tight">
          {amount}
        </p>
        <div className="flex items-center gap-1.5 mt-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
          <span className="text-xs text-[var(--text-muted)]">Live balance</span>
        </div>
      </motion.div>
    );
  }

  const accentColor =
    variant === 'premium' ? 'var(--accent-2)' :
    variant === 'success' ? 'var(--success)' :
    'var(--accent)';

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            {label}
          </p>
          <p className="text-[22px] font-mono-num font-bold text-[var(--text-primary)] leading-none tracking-tight truncate">
            {amount}
          </p>
          {subtext && (
            <p className="text-xs text-[var(--text-muted)] mt-1.5 truncate">{subtext}</p>
          )}
        </div>
        <div
          className="ml-3 flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: `color-mix(in srgb, ${accentColor} 12%, transparent)`, color: accentColor, border: `1px solid color-mix(in srgb, ${accentColor} 22%, transparent)` }}
        >
          {currency}
        </div>
      </div>
    </div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
        {label}
      </label>
    )}
    <input
      className={`px-3.5 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-[14px] focus:outline-none focus:border-[var(--accent)]/50 transition-colors ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
  </div>
);

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <motion.div
    animate={{ opacity: [0.3, 0.55, 0.3] }}
    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
    className={`bg-[var(--surface-2)] border border-[var(--border)] rounded-xl ${className}`}
  />
);
