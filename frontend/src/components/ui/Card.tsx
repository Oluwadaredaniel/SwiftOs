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
}: {
  label: string;
  amount: string;
  currency: string;
  subtext?: string;
}) => (
  <motion.div
    whileHover={{ y: -3, scale: 1.01 }}
    transition={{ type: 'spring', damping: 20 }}
    className="glass relative overflow-hidden rounded-3xl p-6 text-[var(--text-primary)]"
  >
    {/* soft accent wash */}
    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--accent)]/15 blur-3xl" />
    <div className="relative">
      <div className="text-[11px] font-display uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-3">
        {label}
      </div>
      <div className="text-4xl font-mono-num font-semibold mb-2 text-gradient">{amount}</div>
      <div className="text-xs text-[var(--text-secondary)] font-display tracking-wide">{currency}</div>
      {subtext && <div className="text-xs text-[var(--text-muted)] mt-3">{subtext}</div>}
    </div>
  </motion.div>
);

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
