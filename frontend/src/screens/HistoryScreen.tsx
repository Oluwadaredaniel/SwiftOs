'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Skeleton } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { transactionsAPI } from '@/lib/api';
import { ArrowRightLeft, ArrowUpRight, ArrowDownLeft, Smartphone, FileText, Share2, TrendingUp, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

interface HistoryScreenProps {
  onSettingsClick: () => void;
  onTransactionClick?: (txId: string) => void;
}

const TX_ICON: Record<string, { Icon: any; color: string }> = {
  send:    { Icon: ArrowUpRight,   color: 'var(--danger)' },
  receive: { Icon: ArrowDownLeft,  color: 'var(--success)' },
  bill:    { Icon: Smartphone,     color: 'var(--accent)' },
  convert: { Icon: ArrowRightLeft, color: 'var(--accent-2)' },
  link:    { Icon: Share2,         color: 'var(--accent)' },
  save:    { Icon: TrendingUp,     color: 'var(--warning)' },
};

const FILTERS = [
  { id: 'all',     label: 'All' },
  { id: 'send',    label: 'Sends' },
  { id: 'bill',    label: 'Bills' },
  { id: 'convert', label: 'Swaps' },
  { id: 'link',    label: 'Links' },
];

export const HistoryScreen = ({ onSettingsClick, onTransactionClick }: HistoryScreenProps) => {
  const transactions = useStore((s) => s.transactions);
  const setTransactions = useStore((s) => s.setTransactions);
  const loading = useStore((s) => s.loading);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadTransactions(); }, []);

  const loadTransactions = async () => {
    try {
      const res = await transactionsAPI.list({ limit: 100 });
      if (res?.data) setTransactions(res.data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  const filtered = filter === 'all' ? (transactions || []) : (transactions || []).filter((t) => t.type === filter);

  const grouped = filtered.reduce((acc, tx) => {
    const date = formatDate(tx.timestamp);
    if (!acc[date]) acc[date] = [];
    acc[date].push(tx);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-2 custom-scrollbar space-y-4">

        {/* Title */}
        <h2 className="text-[20px] font-semibold text-[var(--text-primary)] px-1">Activity</h2>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap text-[12px] font-medium transition-all flex-shrink-0 border ${
                filter === f.id
                  ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/25'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Transactions */}
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-[60px] w-full" />
            <Skeleton className="h-[60px] w-full" />
            <Skeleton className="h-[60px] w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox size={32} className="mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
            <p className="text-sm font-medium text-[var(--text-secondary)]">No transactions found</p>
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([date, txs]) => (
              <div key={date}>
                <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">{date}</p>
                <div className="space-y-1.5">
                  {txs.map((tx) => {
                    const { Icon, color } = TX_ICON[tx.type] || { Icon: FileText, color: 'var(--text-muted)' };
                    const isDebit = tx.type === 'send' || tx.type === 'bill';
                    return (
                      <div
                        key={tx.id}
                        onClick={() => onTransactionClick?.(tx.id)}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] cursor-pointer active:opacity-70 transition-opacity"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                            style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}
                          >
                            <Icon size={17} style={{ color }} />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-[var(--text-primary)]">{tx.description}</p>
                            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{formatTime(tx.timestamp)}</p>
                          </div>
                        </div>
                        <p className={`text-[14px] font-mono-num font-semibold ${isDebit ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                          {isDebit ? '−' : '+'}
                          {formatCurrency(tx.amount, tx.currency as any)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
