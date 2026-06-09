'use client';

import { motion } from 'framer-motion';
import { Wallet, FileText, Share2, TrendingUp } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';

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

export const TabNav = ({ activeTab, onTabChange }: TabNavProps) => {
  const { haptic } = useTelegram();

  const handleTabChange = (id: string) => {
    haptic('light');
    onTabChange(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong fixed bottom-4 left-4 right-4 rounded-3xl px-2 py-2 flex gap-1 justify-around z-40"
    >
      {TABS.map(({ id, label, icon: Icon }) => (
        <motion.button
          key={id}
          onClick={() => handleTabChange(id)}
          whileTap={{ scale: 0.92 }}
          className="flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-2xl relative"
        >
          {activeTab === id && (
            <motion.div
              layoutId="tabIndicator"
              className="absolute inset-0 rounded-2xl accent-gradient opacity-20 border border-[var(--accent)]/40"
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            />
          )}
          <motion.div
            animate={{ scale: activeTab === id ? 1.1 : 1 }}
            className={`relative z-10 transition-colors ${
              activeTab === id ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            <Icon size={21} />
          </motion.div>
          <span
            className={`text-[11px] font-display font-bold relative z-10 transition-colors ${
              activeTab === id ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            {label}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
};
