'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
}

export const Card = ({ children, className = '', onClick, glow = false }: CardProps) => (
  <motion.div
    whileHover={{ y: -2 }}
    transition={{ type: 'spring', damping: 20 }}
    onClick={onClick}
    className={`glass rounded-2xl p-4 transition-all hover:border-[var(--accent)]/40 ${glow ? 'glow-accent' : ''} ${className}`}
  >
    {children}
  </motion.div>
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
  variant?: 'default' | 'premium' | 'success';
}) => {
  const gradientClass =
    variant === 'premium' ? 'from-[var(--accent-2)] to-[#C084FC]' :
    variant === 'success' ? 'from-[var(--success)] to-[#34D399]' :
    'from-[var(--accent)] to-[var(--accent-2)]';

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', damping: 20 }}
      className="glass relative overflow-hidden rounded-[32px] p-6 text-[var(--text-primary)]"
    >
      {/* Background aurora blur */}
      <div className={`pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl bg-gradient-to-tr ${gradientClass}`} />
      <div className={`pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full opacity-10 blur-3xl bg-gradient-to-tr ${gradientClass}`} />

      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[10px] font-display uppercase tracking-[0.25em] text-[var(--text-secondary)]">
            {label}
          </div>
          <div className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            {currency}
          </div>
        </div>

        <div className="text-[34px] font-mono-num font-bold mb-1 tracking-tight">
          {amount.split('.')[0]}<span className="opacity-40 text-[24px]">.{amount.split('.')[1] || '00'}</span>
        </div>

        {subtext && (
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-display mt-2">
            <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
            {subtext}
          </div>
        )}
      </div>
    </motion.div>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label className="text-[11px] font-display uppercase tracking-[0.18em] text-[var(--text-secondary)]">
        {label}
      </label>
    )}
    <input
      className={`px-4 py-3 rounded-xl border border-[var(--glass-border)] bg-white/[0.04] text-[var(--text-primary)] placeholder-[var(--text-muted)] backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60 focus:border-transparent transition-all ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
  </div>
);

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <motion.div
    animate={{ opacity: [0.4, 0.65, 0.4] }}
    transition={{ duration: 1.8, repeat: Infinity }}
    className={`bg-white/[0.06] border border-[var(--glass-border)] backdrop-blur-md rounded-2xl ${className}`}
  />
);
