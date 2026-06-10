'use client';

import { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { formatCurrency } from '@/lib/utils';
import { billsAPI } from '@/lib/api';
import { motion } from 'framer-motion';

interface BillsScreenProps {
  onAddBillClick: () => void;
  onSettingsClick: () => void;
}

import { Plus, TrendingUp, FileText, Smartphone, Tv, Zap, Globe, Search, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { formatCurrency } from '@/lib/utils';
import { billsAPI } from '@/lib/api';
import { motion } from 'framer-motion';

export const BillsScreen = ({ onAddBillClick, onSettingsClick }: BillsScreenProps) => {
  const bills = useStore((state) => state.bills);
  const setBills = useStore((state) => state.setBills);
  const loading = useStore((state) => state.loading);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const res = await billsAPI.getBills();
      if (res?.data) setBills(res.data);
    } catch (err) {
      console.error('Failed to load bills:', err);
    }
  };

  const upcomingBills = bills?.filter((b) => b.status === 'active') || [];

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-40 px-6 pt-2 custom-scrollbar">
        <div className="space-y-10">

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong relative overflow-hidden rounded-[48px] p-8 text-[var(--text-primary)] border-white/10"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-[80px]" />
            <div className="relative flex justify-between items-center">
              <div>
                <div className="text-[10px] font-display uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-4 opacity-60 font-black">Monthly Outflow</div>
                <div className="text-4xl font-mono-num font-black text-gradient leading-none tracking-tighter">
                  ₦{(upcomingBills.reduce((sum, b) => sum + b.amount, 0) * (4 / 7)).toLocaleString()}
                </div>
              </div>
              <div className="w-14 h-14 rounded-[20px] glass flex items-center justify-center text-[var(--accent)] shadow-2xl">
                <TrendingUp size={28} />
              </div>
            </div>
          </motion.div>

          {/* Quick Categories */}
          <div className="grid grid-cols-4 gap-3">
             {[
               { icon: Smartphone, label: 'Airtime', color: '#00D9FF' },
               { icon: Globe, label: 'Data', color: '#00FF9D' },
               { icon: Tv, label: 'Cable', color: '#FFB347' },
               { icon: Zap, label: 'Power', color: '#FF3B6B' }
             ].map((cat, i) => (
               <motion.button
                 key={i}
                 whileHover={{ y: -3 }}
                 whileTap={{ scale: 0.9 }}
                 onClick={onAddBillClick}
                 className="flex flex-col items-center gap-2.5"
               >
                 <div className="w-14 h-14 rounded-[20px] glass flex items-center justify-center border-white/5 bg-white/[0.02] shadow-sm">
                   <cat.icon size={22} style={{ color: cat.color }} />
                 </div>
                 <span className="text-[10px] font-display font-black text-[var(--text-secondary)] uppercase tracking-wider">{cat.label}</span>
               </motion.button>
             ))}
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-display uppercase tracking-[0.3em] text-[var(--text-secondary)] font-black opacity-60">Scheduled Payments</span>
              <button className="text-[10px] font-display font-black text-[var(--accent)] uppercase tracking-[0.2em]">Autopay ON</button>
            </div>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-[32px]" />
              </div>
            ) : upcomingBills.length === 0 ? (
              <Card className="py-24 text-center border-dashed border-white/5 bg-transparent rounded-[40px]">
                <div className="w-16 h-16 rounded-[24px] glass flex items-center justify-center mx-auto mb-5 shadow-2xl">
                  <FileText size={24} className="text-[var(--text-muted)] opacity-30" />
                </div>
                <p className="text-[15px] text-[var(--text-secondary)] font-display font-bold">Zero scheduled bills</p>
                <p className="text-[11px] text-[var(--text-muted)] opacity-50 mt-1 uppercase tracking-[0.15em]">Automate your bills to save time</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingBills.map((bill, idx) => (
                  <motion.div key={bill.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                    <Card className="flex items-center justify-between py-6 px-7 rounded-[32px] border-white/5 bg-white/[0.01] hover:bg-white/[0.04]">
                      <div className="flex-1">
                        <div className="text-[16px] font-display font-black text-[var(--text-primary)] leading-none mb-1.5">{bill.name}</div>
                        <div className="text-[11px] text-[var(--text-muted)] font-display uppercase tracking-[0.15em] font-black opacity-60 flex items-center gap-2">
                          <CheckCircle2 size={12} className="text-[var(--success)]" />
                          {bill.frequency} • Next: {new Date(bill.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="text-[17px] font-mono-num font-black text-[var(--text-primary)] leading-none">{formatCurrency(bill.amount, 'NGN')}</div>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          className="h-8 px-5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-display font-black uppercase tracking-widest border border-[var(--accent)]/20 hover:bg-[var(--accent)] hover:text-black transition-colors"
                        >
                          Pay
                        </motion.button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-32 right-6">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onAddBillClick}
          className="rounded-[28px] w-18 h-18 flex items-center justify-center shadow-[0_20px_50px_rgba(0,217,255,0.4)] accent-gradient border-0"
        >
          <Plus size={32} className="text-black" />
        </motion.button>
      </div>
    </div>
  );
};
