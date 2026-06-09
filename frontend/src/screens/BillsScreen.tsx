'use client';

import { useState, useEffect } from 'react';
import { Plus, Clock, CheckCircle } from 'lucide-react';
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

export const BillsScreen = ({ onAddBillClick, onSettingsClick }: BillsScreenProps) => {
  const bills = useStore((state) => state.bills);
  const setBills = useStore((state) => state.setBills);

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

  const upcomingBills = bills.filter((b) => b.status === 'active');
  const pastBills = bills.filter((b) => b.status !== 'active');

  return (
    <div className="flex flex-col h-full">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-5 space-y-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass relative overflow-hidden rounded-3xl p-6 text-[var(--text-primary)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--accent-2)]/15 blur-3xl" />
            <div className="relative">
              <div className="text-[11px] font-display uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-3">Total Monthly</div>
              <div className="text-4xl font-mono-num font-semibold text-gradient">₦{(upcomingBills.reduce((sum, b) => sum + b.amount, 0) * (4 / 7)).toLocaleString()}</div>
            </div>
          </motion.div>

          <div>
            <div className="text-xs font-display uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-4">Upcoming Bills</div>
            {upcomingBills.length === 0 ? (
              <Card className="py-8 text-center">
                <p className="text-sm text-[var(--text-muted)]">No upcoming bills</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {upcomingBills.map((bill, idx) => (
                  <motion.div key={bill.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                    <Card className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-display font-bold text-[var(--text-primary)]">{bill.name}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1 font-display">
                          {bill.frequency} • Due {new Date(bill.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-mono-num font-semibold text-[var(--text-primary)]">{formatCurrency(bill.amount, 'NGN')}</div>
                        <Button size="sm" variant="secondary" className="mt-2">Pay</Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs font-display uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-4">Past Payments</div>
            {pastBills.length === 0 ? (
              <Card className="py-4 text-center">
                <p className="text-xs text-[var(--text-muted)]">No past payments</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {pastBills.map((bill) => (
                  <Card key={bill.id} className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-[var(--success)]" />
                    <div className="flex-1">
                      <div className="text-sm font-display font-bold text-[var(--text-primary)]">{bill.name}</div>
                      <div className="text-xs text-[var(--text-muted)] font-display">{formatCurrency(bill.amount, 'NGN')}</div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-24 right-4">
        <Button size="lg" onClick={onAddBillClick} className="rounded-full w-14 h-14 flex items-center justify-center">
          <Plus size={24} />
        </Button>
      </div>
    </div>
  );
};
