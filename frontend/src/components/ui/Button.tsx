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
      'accent-gradient text-black shadow-lg hover:shadow-[0_0_24px_var(--accent-glow)] border-0',
    secondary:
      'glass text-[var(--text-primary)] border-white/5 shadow-md hover:bg-white/5 active:bg-white/10',
    ghost:
      'bg-transparent text-[var(--accent)] hover:bg-[var(--accent)]/10',
    danger:
      'text-white shadow-lg bg-gradient-to-tr from-[var(--danger)] to-[#FF7E9F] border-0',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[13px]',
    md: 'px-6 py-3 text-[14px]',
    lg: 'px-8 py-4 text-[16px] min-h-[56px]',
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
