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

const CATEGORIES = [
  { icon: Smartphone, label: 'Airtime', color: 'var(--accent)' },
  { icon: Globe,      label: 'Data',    color: 'var(--success)' },
  { icon: Tv,         label: 'Cable',   color: 'var(--warning)' },
  { icon: Zap,        label: 'Power',   color: 'var(--danger)' },
];

export const BillsScreen = ({ onAddBillClick, onSettingsClick }: BillsScreenProps) => {
  const bills = useStore((s) => s.bills);
  const setBills = useStore((s) => s.setBills);
  const loading = useStore((s) => s.loading);
  const [payLoading, setPayLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => { loadBills(); }, []);

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
      await billsAPI.payBill({ serviceID: bill.serviceID, amount: bill.amount, phone: bill.billersCode, variation_code: bill.variationCode });
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
  const monthlyOutflow = upcomingBills.reduce((sum, b) => {
    const mult: Record<string, number> = { once: 0, weekly: 4, monthly: 1, biweekly: 2 };
    return sum + b.amount * (mult[b.frequency] ?? 1);
  }, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-2 custom-scrollbar space-y-5">

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl mb-1"
          style={{
            background: 'linear-gradient(145deg, #1a1b23 0%, #1e1f28 60%, #1a1b24 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 2px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F59E0B]/40 to-transparent" />
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)' }} />
          <div className="px-5 py-5 relative">
            <p className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-widest mb-2.5">Monthly Outflow</p>
            <p className="text-[36px] font-mono-num font-bold text-[var(--text-primary)] leading-none">
              ₦{monthlyOutflow.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-[var(--border)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" style={{ boxShadow: '0 0 6px rgba(245,158,11,0.8)' }} />
              <p className="text-[11px] text-[var(--text-muted)]">{upcomingBills.length} active bill{upcomingBills.length !== 1 ? 's' : ''} scheduled</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Add Categories */}
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-1">Quick Add</p>
          <div className="grid grid-cols-4 gap-2.5">
            {CATEGORIES.map(({ icon: Icon, label, color }) => (
              <button
                key={label}
                onClick={onAddBillClick}
                className="flex flex-col items-center gap-2 py-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] active:opacity-70 transition-opacity"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <span className="text-[11px] font-medium text-[var(--text-secondary)]">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Scheduled Bills */}
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-1">Scheduled Payments</p>

          {loading ? (
            <Skeleton className="h-[72px] w-full" />
          ) : upcomingBills.length === 0 ? (
            <div className="py-12 text-center bg-[var(--surface)] border border-[var(--border)] border-dashed rounded-xl">
              <FileText size={24} className="mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
              <p className="text-sm text-[var(--text-secondary)] font-medium">No scheduled bills</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Automate your bills to save time</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[var(--text-primary)] truncate">{bill.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                      <CheckCircle2 size={10} className="text-[var(--success)]" />
                      {bill.frequency} · Due {new Date(bill.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <p className="text-[14px] font-mono-num font-semibold text-[var(--text-primary)]">
                      {formatCurrency(bill.amount, 'NGN')}
                    </p>
                    <button
                      onClick={() => handlePayBill(bill)}
                      disabled={!bill.serviceID || !bill.billersCode || payLoading === bill.id}
                      className="h-8 px-3 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-[11px] font-semibold border border-[var(--accent)]/20 disabled:opacity-40"
                    >
                      {payLoading === bill.id ? <Loader2 size={11} className="animate-spin" /> : 'Pay'}
                    </button>
                    <button
                      onClick={() => handleDeleteBill(bill.id)}
                      disabled={deleteLoading === bill.id}
                      className="h-8 w-8 rounded-lg bg-[var(--danger)]/10 text-[var(--danger)] flex items-center justify-center border border-[var(--danger)]/20 disabled:opacity-40"
                    >
                      {deleteLoading === bill.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={onAddBillClick}
        style={{ bottom: 'max(5.5rem, calc(env(safe-area-inset-bottom) + 5rem))' }}
        className="fixed right-4 w-14 h-14 rounded-2xl accent-gradient flex items-center justify-center shadow-[0_4px_20px_rgba(0,200,240,0.35)] z-30"
      >
        <Plus size={24} className="text-black" />
      </motion.button>
    </div>
  );
};
