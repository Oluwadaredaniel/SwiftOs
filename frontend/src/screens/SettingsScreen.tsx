'use client';

import { useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { useStore } from '@/store/useStore';
import { tokenStore } from '@/lib/api';
import { ArrowLeft, User, Copy, Check, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsScreenProps {
  onBackClick: () => void;
}

export const SettingsScreen = ({ onBackClick }: SettingsScreenProps) => {
  const { user, close } = useTelegram();
  const appUser = useStore((state) => state.user);
  const [copied, setCopied] = useState(false);

  const userId = String(user?.id || appUser?.id || '');

  const handleCopyId = async () => {
    if (!userId) return;
    await navigator.clipboard.writeText(userId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    tokenStore.clear();
    close?.();
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden">
      <div className="flex items-center gap-4 px-6 py-5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onBackClick}
          className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-[var(--text-secondary)] border border-white/5"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h2 className="text-2xl font-display font-black text-[var(--text-primary)] tracking-tighter">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-40 px-6 custom-scrollbar">
        <div className="space-y-5">

          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-[40px] p-7 space-y-6 border-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[20px] accent-gradient flex items-center justify-center text-black flex-shrink-0">
                <User size={28} />
              </div>
              <div>
                <div className="text-[19px] font-display font-black text-[var(--text-primary)] leading-tight">
                  {user?.first_name}{user?.last_name ? ` ${user.last_name}` : ''}
                </div>
                <div className="text-[13px] text-[var(--text-secondary)] font-display font-bold">
                  @{user?.username || 'anonymous'}
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-display uppercase tracking-[0.25em] text-[var(--text-muted)] mb-1 font-black opacity-60">User ID</div>
                <div className="text-[15px] font-mono-num font-bold text-[var(--text-primary)]">{userId || '—'}</div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleCopyId}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[11px] font-display font-black uppercase tracking-widest"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy ID'}
              </motion.button>
            </div>
          </motion.div>

          {/* Logout */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 h-[64px] rounded-[28px] bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] font-display font-black text-[14px] uppercase tracking-wider hover:bg-[var(--danger)]/20 transition-colors"
            >
              <LogOut size={20} />
              Close App
            </motion.button>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
