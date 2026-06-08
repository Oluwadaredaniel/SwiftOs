'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface NavigationProps {
  current: string;
  items: NavItem[];
  onChange: (id: string) => void;
}

export default function Navigation({ current, items, onChange }: NavigationProps) {
  return (
    <nav className="sticky bottom-0 border-t border-[var(--dark-text-secondary)]/20 bg-[var(--dark-surface)] backdrop-blur-sm">
      <div className="flex justify-around items-center gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = current === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onChange(item.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 py-3 px-2 flex flex-col items-center gap-1 transition-colors duration-200 ${
                isActive
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--dark-text-secondary)] hover:text-[var(--dark-text)]'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="h-1 w-6 bg-[var(--primary)] rounded-full"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
