'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) => {
  const baseStyles = 'font-display font-bold rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';

  const variants = {
    primary: 'bg-[var(--accent)] text-[var(--bg-primary)] hover:shadow-[0_0_30px_rgba(0,217,255,0.4)] active:shadow-[0_0_20px_rgba(0,217,255,0.2)]',
    secondary: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--bg-tertiary)] hover:border-[var(--accent)] hover:shadow-[0_0_20px_rgba(0,217,255,0.2)]',
    ghost: 'text-[var(--accent)] hover:bg-[var(--bg-secondary)] border border-[var(--accent)] border-opacity-30',
    danger: 'bg-[var(--danger)] text-white hover:shadow-[0_0_30px_rgba(255,64,129,0.4)]',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base min-h-[44px]',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
          ···
        </motion.span>
      ) : (
        children
      )}
    </motion.button>
  );
};
