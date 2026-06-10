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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        className="relative overflow-hidden p-9 rounded-[48px] text-center glass-strong border-white/10"
      >
        {/* Animated Background Glow */}
        <div className={`absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-20 blur-[80px] bg-gradient-to-tr ${gradientClass} animate-pulse`} />
        <div className={`absolute -left-24 -bottom-24 h-80 w-80 rounded-full opacity-10 blur-[80px] bg-gradient-to-tr ${gradientClass} animate-pulse`} style={{ animationDelay: '1s' }} />

        <div className="relative z-10 flex flex-col items-center">
          <div className="text-[11px] font-display uppercase tracking-[0.4em] text-[var(--text-secondary)] mb-5 opacity-60">
            {label}
          </div>
          <div className="text-5xl font-mono-num font-extrabold tracking-tighter mb-5 text-gradient flex items-baseline gap-1">
            <span className="text-[32px] opacity-70 font-display">₦</span>
            {amount.split('.')[0]}<span className="opacity-25 text-[28px]">.{amount.split('.')[1] || '00'}</span>
          </div>
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-[20px] bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shadow-[0_0_8px_var(--success)]" />
            <span className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-[var(--text-primary)]">Secured by SwiftyEx</span>
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
        <div className="space-y-1">
          <div className="text-[10px] font-display uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-60">
            {label}
          </div>
          <div className="text-[24px] font-mono-num font-bold tracking-tight">
            {amount.split('.')[0]}<span className="opacity-30 text-[18px]">.{amount.split('.')[1] || '00'}</span>
          </div>
          {subtext && (
            <div className="text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-1.5">
               <div className="w-1 h-1 rounded-full bg-white/20" />
               {subtext}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.15em]">
            {currency}
          </div>
          {variant === 'success' && (
             <div className="text-[10px] text-[var(--success)] font-bold bg-[var(--success)]/10 px-2 py-0.5 rounded-lg border border-[var(--success)]/20">
               +2.4% APY
             </div>
          )}
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
