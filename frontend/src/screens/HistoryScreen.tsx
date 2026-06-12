'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Card, Skeleton } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils';
import { transactionsAPI } from '@/lib/api';
import { ArrowRightLeft, ArrowUpRight, ArrowDownLeft, Smartphone, FileText, Share2, TrendingUp, Inbox, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface HistoryScreenProps {
  onSettingsClick: () => void;
  onTransactionClick?: (txId: string) => void;
}

export const HistoryScreen = ({ onSettingsClick, onTransactionClick }: HistoryScreenProps) => {
  const transactions = useStore((state) => state.transactions);
  const setTransactions = useStore((state) => state.setTransactions);
  const loading = useStore((state) => state.loading);
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

  const getTxBg = (type: string): string => ({
    send: 'rgba(255,59,107,0.13)',
    receive: 'rgba(0,255,157,0.13)',
    bill: 'rgba(0,217,255,0.13)',
    convert: 'rgba(139,92,246,0.13)',
    link: 'rgba(0,217,255,0.13)',
    save: 'rgba(255,179,71,0.13)',
  } as Record<string, string>)[type] || 'rgba(255,255,255,0.06)';

  const getTxIcon = (type: string) => {
    switch (type) {
      case 'send': return <ArrowUpRight className="text-[var(--danger)]" size={20} />;
      case 'receive': return <ArrowDownLeft className="text-[var(--success)]" size={20} />;
      case 'bill': return <Smartphone className="text-[var(--accent)]" size={20} />;
      case 'convert': return <ArrowRightLeft className="text-[var(--accent-2)]" size={20} />;
      case 'link': return <Share2 className="text-[var(--accent)]" size={20} />;
      case 'save': return <TrendingUp className="text-[var(--warning)]" size={20} />;
      default: return <FileText className="text-[var(--text-secondary)]" size={20} />;
    }
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'send', label: 'Send' },
    { id: 'bill', label: 'Bills' },
    { id: 'convert', label: 'Swap' },
    { id: 'link', label: 'Links' },
  ];

  const filtered = filter === 'all' ? (transactions || []) : (transactions || []).filter((t) => t.type === filter);

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
    <div className="flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-32 px-6 pt-2 custom-scrollbar">
        <div className="space-y-10 py-4">

          <div className="space-y-6">
            <div className="px-1">
               <h2 className="text-3xl font-display font-black text-[var(--text-primary)] tracking-tighter">Activity</h2>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {filters.map((f) => (
                <motion.button
                  key={f.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(f.id)}
                  className={`px-6 py-3 rounded-[20px] whitespace-nowrap text-[13px] font-display font-black transition-all border ${
                    filter === f.id
                      ? 'accent-gradient text-black border-transparent shadow-[0_10px_25px_rgba(0,217,255,0.3)]'
                      : 'glass text-[var(--text-secondary)] border-white/5 opacity-60'
                  }`}
                >
                  {f.label}
                </motion.button>
              ))}
            </div>
          </div>

          {loading ? (
             <div className="space-y-6">
               <Skeleton className="h-24 w-full rounded-[32px]" />
               <Skeleton className="h-24 w-full rounded-[32px]" />
             </div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-20 h-20 rounded-[32px] glass flex items-center justify-center mx-auto mb-6 opacity-30">
                <Inbox size={32} className="text-[var(--text-muted)]" />
              </div>
              <p className="text-[17px] font-display font-black text-[var(--text-secondary)]">Clean slate</p>
              <p className="text-[12px] text-[var(--text-muted)] mt-1 uppercase tracking-[0.2em] font-bold">No transactions found here</p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedByDate).map(([date, txs]) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <Calendar size={14} className="text-[var(--accent)] opacity-50" />
                    <h4 className="text-[11px] font-display font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">{date}</h4>
                  </div>
                  <div className="space-y-3">
                    {txs.map((tx) => (
                      <Card key={tx.id} onClick={() => onTransactionClick?.(tx.id)} className="cursor-pointer flex items-center justify-between py-6 px-7 rounded-[32px] border-white/5 bg-white/[0.01] hover:bg-white/[0.03]">
                        <div className="flex items-center gap-5">
                          <div className="w-11 h-11 rounded-[14px] flex-shrink-0 flex items-center justify-center" style={{ background: getTxBg(tx.type) }}>
                            {getTxIcon(tx.type)}
                          </div>
                          <div>
                            <div className="text-[16px] font-display font-black text-[var(--text-primary)] leading-none mb-1.5">{tx.description}</div>
                            <div className="text-[11px] text-[var(--text-muted)] mt-1 font-medium">{formatTime(tx.timestamp)}</div>
                          </div>
                        </div>
                        <div className={`text-[17px] font-mono-num font-black ${tx.type === 'send' || tx.type === 'bill' ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                          {tx.type === 'send' || tx.type === 'bill' ? '-' : '+'}
                          {formatCurrency(tx.amount, tx.currency as any)}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
