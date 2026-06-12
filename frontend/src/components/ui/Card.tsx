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
  variant?: 'default' | 'premium' | 'success' | 'large';
}) => {
  const gradientClass =
    variant === 'premium' ? 'from-[var(--accent-2)] to-[#C084FC]' :
    variant === 'success' ? 'from-[var(--success)] to-[#34D399]' :
    'from-[var(--accent)] to-[var(--accent-2)]';

  if (variant === 'large') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden px-8 pt-9 pb-10 rounded-[40px] glass-strong border-white/10"
      >
        <div className={`pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full opacity-[0.13] blur-[48px] bg-gradient-to-br ${gradientClass}`} />

        <div className="relative z-10">
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
            {label}
          </div>

          <div className="text-[52px] font-mono-num font-bold text-gradient leading-none tracking-tight mb-5">
            {amount}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" style={{ boxShadow: '0 0 6px var(--success)' }} />
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Balances are live</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, backgroundColor: 'rgba(255,255,255,0.06)' }}
      whileTap={{ scale: 0.98 }}
      className="glass relative overflow-hidden rounded-[32px] p-6 text-[var(--text-primary)] border-white/5"
    >
      <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-10 blur-3xl bg-gradient-to-tr ${gradientClass}`} />

      <div className="relative flex justify-between items-center">
        <div className="space-y-0.5">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {label}
          </div>
          <div className="text-[22px] font-mono-num font-bold tracking-tight">
            {amount}
          </div>
          {subtext && (
            <div className="text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-1.5 pt-0.5">
               <div className="w-1 h-1 rounded-full bg-white/20" />
               {subtext}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.15em]">
            {currency}
          </div>
        </div>
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
