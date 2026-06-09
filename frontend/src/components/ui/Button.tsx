'use client';

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
  const baseStyles =
    'font-display font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';

  const variants = {
    primary:
      'accent-gradient text-[var(--bg-primary)] shadow-[0_8px_24px_rgba(0,217,255,0.25)] hover:shadow-[0_8px_32px_rgba(0,217,255,0.45)]',
    secondary:
      'glass text-[var(--text-primary)] hover:border-[var(--accent)]/50 hover:shadow-[0_0_24px_var(--accent-glow)]',
    ghost:
      'bg-transparent text-[var(--accent)] border border-[var(--accent)]/40 hover:bg-[var(--accent)]/10',
    danger:
      'text-white shadow-[0_8px_24px_rgba(255,92,138,0.25)] hover:shadow-[0_8px_32px_rgba(255,92,138,0.45)] bg-[linear-gradient(120deg,#FF5C8A,#FF8A3D)]',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-6 py-4 text-base min-h-[44px]',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
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
