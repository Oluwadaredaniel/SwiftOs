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
  const base = 'font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 flex-shrink-0';

  const variants = {
    primary:   'accent-gradient text-black border-0 shadow-[0_2px_12px_rgba(0,200,240,0.2)]',
    secondary: 'bg-[var(--surface-2)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-strong)]',
    ghost:     'bg-transparent text-[var(--accent)] hover:bg-[var(--accent-dim)]',
    danger:    'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/25 hover:bg-[var(--danger)]/20',
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-[13px] h-9',
    md: 'px-5 py-2.5 text-[14px] h-10',
    lg: 'px-6 py-3 text-[15px] h-12',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className || ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }}>
          ···
        </motion.span>
      ) : (
        children
      )}
    </motion.button>
  );
};
