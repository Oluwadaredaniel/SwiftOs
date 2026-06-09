'use client';

import { Settings } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import { motion } from 'framer-motion';

interface HeaderProps {
  onSettingsClick?: () => void;
  showSettings?: boolean;
}

export const Header = ({ onSettingsClick, showSettings = true }: HeaderProps) => {
  const { user } = useTelegram();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 px-4 py-4 flex items-center justify-between bg-[var(--bg-primary)]/40 backdrop-blur-xl border-b border-[var(--glass-border)]"
    >
      <div className="flex items-center gap-3">
        {user?.photo_url ? (
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={user.photo_url}
            alt={user.first_name}
            className="w-10 h-10 rounded-2xl border border-[var(--accent)]/40 shadow-[0_0_16px_var(--accent-glow)]"
          />
        ) : (
          <div className="w-10 h-10 rounded-2xl accent-gradient flex items-center justify-center text-[var(--bg-primary)] font-display font-bold">
            {(user?.first_name || 'S').charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <div className="text-sm font-display font-extrabold tracking-tight text-gradient">SwiftyOS</div>
          <div className="text-xs text-[var(--text-secondary)] font-display">
            {user?.first_name ? `Hi, ${user.first_name}` : 'Welcome'}
          </div>
        </div>
      </div>

      {showSettings && (
        <motion.button
          whileHover={{ scale: 1.1, rotate: 20 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSettingsClick}
          className="p-2.5 rounded-xl glass text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          <Settings size={18} />
        </motion.button>
      )}
    </motion.div>
  );
};
