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
    whileHover={{ scale: 1.01 }}
    transition={{ type: 'spring', damping: 20 }}
    onClick={onClick}
    className={`rounded-lg bg-[var(--bg-secondary)] border border-[var(--bg-tertiary)] p-4 backdrop-blur-sm ${glow ? 'shadow-[0_0_20px_rgba(0,217,255,0.2)]' : ''} hover:border-[var(--accent)] hover:border-opacity-50 transition-all ${className}`}
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
    whileHover={{ scale: 1.02 }}
    transition={{ type: 'spring', damping: 20 }}
    className="rounded-lg bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-tertiary)] to-[var(--bg-secondary)] border border-[var(--accent)] border-opacity-20 p-6 text-[var(--text-primary)] shadow-[0_0_30px_rgba(0,217,255,0.15)] hover:shadow-[0_0_40px_rgba(0,217,255,0.25)] transition-all backdrop-blur-sm"
  >
    <div className="text-xs font-display uppercase tracking-widest text-[var(--text-secondary)] mb-3">{label}</div>
    <div className="text-4xl font-display font-bold mb-2 text-[var(--accent)]">{amount}</div>
    <div className="text-xs text-[var(--text-secondary)] font-display">{currency}</div>
    {subtext && <div className="text-xs text-[var(--text-muted)] mt-3">{subtext}</div>}
  </motion.div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => (
  <div className="flex flex-col gap-2">
    {label && <label className="text-xs font-display uppercase tracking-widest text-[var(--text-secondary)]">{label}</label>}
    <input
      className={`px-4 py-3 rounded-md border border-[var(--bg-tertiary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all backdrop-blur-sm ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
  </div>
);

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <motion.div
    animate={{ opacity: [0.5, 0.7, 0.5] }}
    transition={{ duration: 2, repeat: Infinity }}
    className={`bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-tertiary)] to-[var(--bg-secondary)] rounded-md ${className}`}
  />
);
