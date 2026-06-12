'use client';

import { useState } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { useStore } from '@/store/useStore';
import { tokenStore, devAPI } from '@/lib/api';
import { ArrowLeft, User, Copy, Check, LogOut, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsScreenProps {
  onBackClick: () => void;
}

export const SettingsScreen = ({ onBackClick }: SettingsScreenProps) => {
  const { user, close } = useTelegram();
  const appUser = useStore((s) => s.user);
  const balances = useStore((s) => s.balances);
  const setBalances = useStore((s) => s.setBalances);
  const [copied, setCopied] = useState(false);
  const [fundLoading, setFundLoading] = useState<string | null>(null);
  const [fundResult, setFundResult] = useState<string | null>(null);

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

  const handleFund = async (amount: number, currency: 'NGN' | 'USDT' | 'USD', label: string) => {
    setFundLoading(label);
    setFundResult(null);
    try {
      await devAPI.fund(amount, currency);
    } catch {}
    // Always update store locally
    const newBalances = { ...balances };
    if (currency === 'NGN') newBalances.ngn = balances.ngn + amount;
    else if (currency === 'USDT') newBalances.usdt = balances.usdt + amount;
    else if (currency === 'USD') newBalances.usd = balances.usd + amount;
    setBalances(newBalances);
    setFundResult(`✓ Added ${label} to your wallet`);
    setFundLoading(null);
  };

  const FUND_OPTIONS = [
    { label: '₦50,000 NGN', amount: 50000, currency: 'NGN' as const },
    { label: '100 USDT',    amount: 100,   currency: 'USDT' as const },
    { label: '$50 USD',     amount: 50,    currency: 'USD' as const },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-4 flex-shrink-0">
        <button
          onClick={onBackClick}
          className="w-9 h-9 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)]"
        >
          <ArrowLeft size={17} />
        </button>
        <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 px-4 custom-scrollbar space-y-4">

        {/* Profile */}
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full accent-gradient flex items-center justify-center text-black flex-shrink-0">
              <User size={22} />
            </div>
            <div>
              <p className="text-[16px] font-semibold text-[var(--text-primary)]">
                {user?.first_name}{user?.last_name ? ` ${user.last_name}` : ''}
              </p>
              <p className="text-[13px] text-[var(--text-secondary)]">@{user?.username || 'anonymous'}</p>
            </div>
          </div>

          <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">User ID</p>
              <p className="text-[14px] font-mono-num font-medium text-[var(--text-primary)]">{userId || '—'}</p>
            </div>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-[11px] font-medium"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy ID'}
            </button>
          </div>
        </div>

        {/* Demo / Test Funds */}
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-4 space-y-3">
          <div>
            <p className="text-[14px] font-semibold text-[var(--text-primary)]">Demo / Test Funds</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Add test funds to try the app features</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {FUND_OPTIONS.map(({ label, amount, currency }) => (
              <button
                key={label}
                onClick={() => handleFund(amount, currency, label)}
                disabled={!!fundLoading}
                className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[12px] font-medium text-[var(--text-primary)] disabled:opacity-50 active:opacity-70 transition-opacity"
              >
                {fundLoading === label ? (
                  <Loader2 size={14} className="animate-spin text-[var(--accent)]" />
                ) : (
                  <span className="text-[var(--accent)] font-bold text-[10px]">+</span>
                )}
                <span className="text-[11px] font-medium text-[var(--text-secondary)] text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>

          {fundResult && (
            <p className={`text-[11px] font-medium px-3 py-2 rounded-lg ${
              fundResult.startsWith('✓')
                ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20'
                : 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'
            }`}>
              {fundResult}
            </p>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] font-semibold text-[14px] active:opacity-70 transition-opacity"
        >
          <LogOut size={18} />
          Close App
        </button>

      </div>
    </div>
  );
};
