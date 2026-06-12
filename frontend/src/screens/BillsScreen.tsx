'use client';

import { Plus, TrendingUp, FileText, Smartphone, Tv, Zap, Globe, CheckCircle2, Trash2, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Card, Skeleton } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { formatCurrency } from '@/lib/utils';
import { billsAPI, autobillsAPI } from '@/lib/api';
import { Bill } from '@/types';
import { motion } from 'framer-motion';

interface BillsScreenProps {
  onAddBillClick: () => void;
  onSettingsClick: () => void;
}

export const BillsScreen = ({ onAddBillClick, onSettingsClick }: BillsScreenProps) => {
  const bills = useStore((state) => state.bills);
  const setBills = useStore((state) => state.setBills);
  const loading = useStore((state) => state.loading);
  const [payLoading, setPayLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

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

  const handlePayBill = async (bill: Bill) => {
    if (!bill.serviceID || !bill.billersCode || payLoading) return;
    setPayLoading(bill.id);
    try {
      await billsAPI.payBill({
        serviceID: bill.serviceID,
        amount: bill.amount,
        phone: bill.billersCode,
        variation_code: bill.variationCode,
      });
      await loadBills();
    } catch (err) {
      console.error('Pay bill failed:', err);
    } finally {
      setPayLoading(null);
    }
  };

  const handleDeleteBill = async (id: string) => {
    if (deleteLoading) return;
    setDeleteLoading(id);
    try {
      await autobillsAPI.delete(id);
      await loadBills();
    } catch (err) {
      console.error('Delete bill failed:', err);
    } finally {
      setDeleteLoading(null);
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
               { icon: Smartphone, label: 'Airtime', color: 'var(--accent)', glow: 'rgba(0, 217, 255, 0.3)' },
               { icon: Globe, label: 'Data', color: 'var(--success)', glow: 'rgba(0, 255, 157, 0.2)' },
               { icon: Tv, label: 'Cable', color: 'var(--warning)', glow: 'rgba(255, 179, 71, 0.2)' },
               { icon: Zap, label: 'Power', color: 'var(--danger)', glow: 'rgba(255, 59, 107, 0.2)' }
             ].map((cat, i) => (
               <motion.button
                 key={i}
                 whileHover={{ y: -5 }}
                 whileTap={{ scale: 0.9 }}
                 onClick={onAddBillClick}
                 className="flex flex-col items-center gap-3 group"
               >
                 <div
                   className="w-16 h-16 rounded-[24px] glass flex items-center justify-center border-white/5 bg-white/[0.02] transition-all group-hover:bg-white/10 group-hover:border-white/20 shadow-lg"
                   style={{ boxShadow: `0 10px 30px -5px ${cat.glow}` }}
                 >
                   <cat.icon size={26} style={{ color: cat.color }} />
                 </div>
                 <span className="text-[11px] font-display font-black text-[var(--text-secondary)] uppercase tracking-[0.1em] group-hover:text-[var(--text-primary)] transition-colors">{cat.label}</span>
               </motion.button>
             ))}
          </div>

          <div className="space-y-5">
            <div className="px-2">
              <span className="text-[11px] font-display uppercase tracking-[0.3em] text-[var(--text-secondary)] font-black opacity-60">Scheduled Payments</span>
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
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handlePayBill(bill)}
                            disabled={!bill.serviceID || !bill.billersCode || payLoading === bill.id}
                            className="h-8 px-5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-display font-black uppercase tracking-widest border border-[var(--accent)]/20 hover:bg-[var(--accent)] hover:text-black transition-colors disabled:opacity-40"
                          >
                            {payLoading === bill.id ? <Loader2 size={12} className="animate-spin" /> : 'Pay'}
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteBill(bill.id)}
                            disabled={deleteLoading === bill.id}
                            className="h-8 w-8 rounded-full bg-[var(--danger)]/10 text-[var(--danger)] flex items-center justify-center border border-[var(--danger)]/20 hover:bg-[var(--danger)]/20 transition-colors disabled:opacity-40"
                          >
                            {deleteLoading === bill.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </motion.button>
                        </div>
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
