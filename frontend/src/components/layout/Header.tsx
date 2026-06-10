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
      className="sticky top-0 z-30 px-6 py-6 flex items-center justify-between bg-transparent pointer-events-none"
    >
      <div className="flex items-center gap-3 pointer-events-auto">
        {user?.photo_url ? (
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={user.photo_url}
            alt={user.first_name}
            className="w-11 h-11 rounded-[14px] border-2 border-white/10 shadow-xl"
          />
        ) : (
          <div className="w-11 h-11 rounded-[14px] glass flex items-center justify-center text-[var(--accent)] font-display font-extrabold text-lg border-2 border-[var(--accent)]/30">
            {(user?.first_name || 'S').charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col">
          <div className="text-[11px] font-display uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-80 leading-none mb-1">SwiftyOS</div>
          <div className="text-[15px] text-[var(--text-primary)] font-display font-extrabold leading-none">
            {user?.first_name ? user.first_name : 'Dashboard'}
          </div>
        </div>
      </div>

      {showSettings && (
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onSettingsClick}
          className="p-3 rounded-2xl glass text-[var(--text-primary)] pointer-events-auto border-white/5 shadow-lg"
        >
          <Settings size={20} className="opacity-80" />
        </motion.button>
      )}
    </motion.div>
  );
};
