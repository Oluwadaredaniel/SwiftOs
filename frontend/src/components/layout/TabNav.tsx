'use client';

import { motion } from 'framer-motion';
import { Wallet, FileText, Share2, TrendingUp, Clock } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';

interface TabNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'wallet',  label: 'Wallet',  icon: Wallet },
  { id: 'bills',   label: 'Bills',   icon: FileText },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'links',   label: 'Links',   icon: Share2 },
  { id: 'savings', label: 'Savings', icon: TrendingUp },
];

export const TabNav = ({ activeTab, onTabChange }: TabNavProps) => {
  const { haptic } = useTelegram();

  return (
    <div
      style={{ bottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}
      className="fixed left-4 right-4 z-40 bg-[var(--surface-2)] border border-[var(--border-strong)] rounded-2xl px-1 py-1 flex"
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => { haptic('light'); onTabChange(id); }}
            className="flex-1 flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl relative transition-colors"
          >
            {active && (
              <motion.div
                layoutId="tabBg"
                className="absolute inset-0 rounded-xl bg-[var(--accent)]/10"
                transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              />
            )}
            <Icon
              size={20}
              className="relative z-10 transition-colors"
              style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
            />
            <span
              className="text-[10px] font-medium relative z-10 transition-colors leading-none"
              style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
