'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', gradient = false, onClick }: CardProps) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`rounded-lg p-4 ${
        gradient
          ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)]'
          : 'bg-[var(--dark-surface)]'
      } border border-[var(--dark-text-secondary)]/10 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
}: ButtonProps) {
  const variants = {
    primary: 'bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white',
    secondary: 'bg-[var(--dark-surface)] hover:bg-[var(--dark-text-secondary)]/10 text-[var(--dark-text)] border border-[var(--dark-text-secondary)]/20',
    danger: 'bg-[var(--danger)] hover:bg-red-600 text-white',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-base min-h-[44px]',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        rounded-lg font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2
        ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}
      `}
    >
      {loading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </motion.button>
  );
}

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-[var(--dark-text-secondary)]/10 rounded animate-pulse ${className}`}
        />
      ))}
    </>
  );
}
