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
      className="bg-[var(--bg-secondary)] border-b border-[var(--accent)] border-opacity-10 px-4 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        {user?.photo_url && (
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={user.photo_url}
            alt={user.first_name}
            className="w-10 h-10 rounded-md border border-[var(--accent)] border-opacity-30"
          />
        )}
        <div>
          <div className="text-xs font-display uppercase tracking-widest text-[var(--accent)]">SwiftyOS</div>
          <div className="text-sm text-[var(--text-secondary)] font-display">
            {user?.first_name || 'Welcome'}
          </div>
        </div>
      </div>

      {showSettings && (
        <motion.button
          whileHover={{ scale: 1.1, rotate: 20 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSettingsClick}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          <Settings size={20} />
        </motion.button>
      )}
    </motion.div>
  );
};
