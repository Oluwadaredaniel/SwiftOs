'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { formatCurrency, formatDate, formatTime, getTransactionIcon } from '@/lib/utils';
import { transactionsAPI } from '@/lib/api';

interface HistoryScreenProps {
  onSettingsClick: () => void;
  onTransactionClick?: (txId: string) => void;
}

export const HistoryScreen = ({ onSettingsClick, onTransactionClick }: HistoryScreenProps) => {
  const transactions = useStore((state) => state.transactions);
  const setTransactions = useStore((state) => state.setTransactions);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const res = await transactionsAPI.list({ limit: 100 });
      if (res?.data) setTransactions(res.data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  const filters = ['all', 'send', 'receive', 'bill', 'link', 'save'];
  const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter);

  const groupedByDate = filtered.reduce(
    (acc, tx) => {
      const date = formatDate(tx.timestamp);
      if (!acc[date]) acc[date] = [];
      acc[date].push(tx);
      return acc;
    },
    {} as Record<string, any[]>
  );

  return (
    <div className="flex flex-col h-full">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-5 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-display font-bold transition ${
                  filter === f
                    ? 'accent-gradient text-[var(--bg-primary)] shadow-[0_0_18px_var(--accent-glow)]'
                    : 'glass text-[var(--text-secondary)]'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <Card className="py-8 text-center">
              <p className="text-sm text-[var(--text-muted)]">No transactions</p>
            </Card>
          ) : (
            Object.entries(groupedByDate).map(([date, txs]) => (
              <div key={date} className="space-y-2">
                <h4 className="text-xs font-display font-bold text-[var(--text-secondary)] uppercase tracking-[0.18em] px-1">{date}</h4>
                {txs.map((tx) => (
                  <Card key={tx.id} onClick={() => onTransactionClick?.(tx.id)} className="cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTransactionIcon(tx.type)}</span>
                      <div>
                        <div className="text-sm font-display font-bold text-[var(--text-primary)]">{tx.description}</div>
                        <div className="text-xs text-[var(--text-secondary)] font-mono-num">{formatTime(tx.timestamp)}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-mono-num font-semibold ${tx.type === 'send' ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                      {tx.type === 'send' ? '-' : '+'}
                      {formatCurrency(tx.amount, tx.currency as any)}
                    </div>
                  </Card>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
