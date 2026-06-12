'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Zap, Send, Download, Copy, Check, Share2, TrendingUp, FileText, RefreshCw } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useTelegram } from '@/hooks/useTelegram';
import { formatCurrency, copyToClipboard } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { walletAPI, transactionsAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const TX_META: Record<string, { icon: any; color: string; label: string }> = {
  send:    { icon: ArrowUpRight,   color: '#F43F5E', label: 'Sent' },
  receive: { icon: ArrowDownLeft,  color: '#22C55E', label: 'Received' },
  bill:    { icon: Zap,            color: '#00C8F0', label: 'Bill' },
  convert: { icon: ArrowRightLeft, color: '#7B5FFF', label: 'Converted' },
  link:    { icon: Share2,         color: '#00C8F0', label: 'Link' },
  save:    { icon: TrendingUp,     color: '#F59E0B', label: 'Saved' },
};

export const WalletScreen = ({
  onSendClick,
  onReceiveClick,
  onConvertClick,
  onBillsClick,
  onSettingsClick,
  onViewAllTransactions,
}: {
  onSendClick: () => void;
  onReceiveClick: () => void;
  onConvertClick: () => void;
  onBillsClick: () => void;
  onSettingsClick: () => void;
  onViewAllTransactions: () => void;
}) => {
  const { haptic } = useTelegram();
  const balances = useStore((s) => s.balances);
  const transactions = useStore((s) => s.transactions);
  const loading = useStore((s) => s.loading);
  const setBalances = useStore((s) => s.setBalances);
  const setTransactions = useStore((s) => s.setTransactions);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { refreshData(); }, []);

  const refreshData = async () => {
    try {
      const [balanceRes, txRes] = await Promise.all([
        walletAPI.getBalance(),
        transactionsAPI.list({ limit: 5 }),
      ]);
      if (balanceRes?.data) setBalances(balanceRes.data);
      if (txRes?.data) setTransactions(txRes.data);
    } catch (err) {
      console.error('Failed to refresh wallet data:', err);
    }
  };

  const handleRefresh = async () => {
    if (refreshing) return;
    haptic('light');
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleCopyAddress = async () => {
    if (!balances.usdt_address) return;
    haptic('light');
    await copyToClipboard(balances.usdt_address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const ACTIONS = [
    { label: 'Send',    icon: Send,           action: onSendClick,    color: '#00C8F0', bg: 'rgba(0,200,240,0.1)' },
    { label: 'Receive', icon: Download,       action: onReceiveClick, color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Bills',   icon: Zap,            action: onBillsClick,   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Convert', icon: ArrowRightLeft, action: onConvertClick, color: '#7B5FFF', bg: 'rgba(123,95,255,0.1)' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-1 custom-scrollbar">

        {/* ── Hero Balance Card ── */}
        {loading ? (
          <Skeleton className="h-[148px] w-full mb-4" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(145deg, #1a1b23 0%, #1e1f28 60%, #1a1b24 100%)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 2px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* Subtle accent top line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00C8F0]/40 to-transparent" />

            {/* Background glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,200,240,0.06) 0%, transparent 70%)' }} />

            <div className="px-5 py-5">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2.5">Total Portfolio</p>
                  <p className="text-[38px] font-mono-num font-bold text-[var(--text-primary)] leading-none tracking-tight">
                    {formatCurrency(balances.ngn || 0, 'NGN')}
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  <motion.div animate={refreshing ? { rotate: 360 } : {}} transition={{ duration: 0.8, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
                    <RefreshCw size={15} />
                  </motion.div>
                </button>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" style={{ boxShadow: '0 0 6px rgba(34,197,94,0.8)' }} />
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">Live balance</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                  <span className="font-mono-num">{formatCurrency(balances.usdt || 0, 'USDT')}</span>
                  <span className="opacity-40">·</span>
                  <span className="font-mono-num">{formatCurrency(balances.usd || 0, 'USD')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {ACTIONS.map(({ label, icon: Icon, action, color, bg }) => (
            <button
              key={label}
              onClick={() => { haptic('light'); action(); }}
              className="flex flex-col items-center gap-2 py-3.5 rounded-xl border border-[var(--border)] active:opacity-60 transition-opacity"
              style={{ background: 'var(--surface-2)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={17} style={{ color }} />
              </div>
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </button>
          ))}
        </div>

        {/* ── Assets ── */}
        <div className="mb-5">
          <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-widest px-1 mb-2.5">Assets</p>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-[68px] w-full" />
              <Skeleton className="h-[68px] w-full" />
            </div>
          ) : (
            <div className="space-y-2">
              <AssetRow label="USDT" sublabel="Stablecoin · Available for links" amount={formatCurrency(balances.usdt || 0, 'USDT')} color="#22C55E" />
              <AssetRow label="USD" sublabel="Virtual Dollar · Intl payments" amount={formatCurrency(balances.usd || 0, 'USD')} color="#7B5FFF" />
              {balances.usdt_address && (
                <button
                  onClick={handleCopyAddress}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] active:opacity-60 transition-opacity"
                >
                  <span className="text-[11px] font-mono text-[var(--text-muted)] truncate mr-2">
                    {balances.usdt_address.slice(0, 18)}…{balances.usdt_address.slice(-4)}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--accent)] flex-shrink-0">
                    {copiedAddress ? <Check size={11} /> : <Copy size={11} />}
                    {copiedAddress ? 'Copied' : 'Copy'}
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Recent Activity ── */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2.5">
            <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-widest">Recent Activity</p>
            {transactions && transactions.length > 0 && (
              <button onClick={onViewAllTransactions} className="text-[11px] font-medium text-[var(--accent)]">All →</button>
            )}
          </div>

          {loading ? (
            <div className="space-y-1.5">
              <Skeleton className="h-[60px] w-full" />
              <Skeleton className="h-[60px] w-full" />
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="py-10 text-center rounded-xl border border-dashed border-[var(--border)]">
              <FileText size={22} className="mx-auto mb-2 opacity-20 text-[var(--text-muted)]" />
              <p className="text-[13px] text-[var(--text-muted)]">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {transactions.slice(0, 4).map((tx) => {
                const meta = TX_META[tx.type] || { icon: FileText, color: 'var(--text-muted)', label: tx.type };
                const Icon = meta.icon;
                const isDebit = tx.type === 'bill' || tx.type === 'send';
                return (
                  <div key={tx.id} className="flex items-center justify-between px-3.5 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: `${meta.color}18` }}>
                        <Icon size={16} style={{ color: meta.color }} />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[var(--text-primary)] leading-tight">{tx.description}</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                          {new Date(tx.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <p className="text-[13px] font-mono-num font-semibold" style={{ color: isDebit ? '#F43F5E' : '#22C55E' }}>
                      {isDebit ? '−' : '+'}{formatCurrency(tx.amount, tx.currency as any)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

const AssetRow = ({ label, sublabel, amount, color }: { label: string; sublabel: string; amount: string; color: string }) => (
  <div className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold" style={{ background: `${color}15`, color }}>
        {label.slice(0, 1)}
      </div>
      <div>
        <p className="text-[13px] font-semibold text-[var(--text-primary)]">{label}</p>
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{sublabel}</p>
      </div>
    </div>
    <p className="text-[14px] font-mono-num font-semibold text-[var(--text-primary)]">{amount}</p>
  </div>
);
