'use client';

import { motion } from 'framer-motion';
import { Wallet, FileText, Share2, TrendingUp } from 'lucide-react';

interface TabNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'bills', label: 'Bills', icon: FileText },
  { id: 'links', label: 'Links', icon: Share2 },
  { id: 'savings', label: 'Savings', icon: TrendingUp },
];
import { useTelegram } from '@/hooks/useTelegram';

export const TabNav = ({ activeTab, onTabChange }: TabNavProps) => {
  const { haptic } = useTelegram();

  const handleTabChange = (id: string) => {
    haptic('light');
    onTabChange(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-[var(--bg-secondary)] border-t border-[var(--accent)] border-opacity-10 px-3 py-3 flex gap-1 justify-around backdrop-blur-sm z-40"
    >
      {TABS.map(({ id, label, icon: Icon }) => (
        <motion.button
          key={id}
          onClick={() => handleTabChange(id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 flex flex-col items-center gap-1.5 py-2 px-2 rounded-md relative transition-colors"
        >
          {activeTab === id && (
            <motion.div
              layoutId="tabIndicator"
              className="absolute inset-0 bg-[var(--accent)] bg-opacity-10 rounded-md border border-[var(--accent)] border-opacity-30"
              transition={{ type: 'spring', damping: 20 }}
            />
          )}
          <motion.div
            animate={{ scale: activeTab === id ? 1.1 : 1 }}
            className={`relative z-10 transition-colors ${activeTab === id ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}
          >
            <Icon size={22} />
          </motion.div>
          <span className={`text-xs font-display font-bold relative z-10 transition-colors ${activeTab === id ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
            {label}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
};
