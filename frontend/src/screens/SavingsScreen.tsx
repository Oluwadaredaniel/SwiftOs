'use client';

import { useState, useEffect } from 'react';
import { Plus, Target, ShieldCheck, Heart, Briefcase, Zap, PlusCircle, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Skeleton, Input } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { formatCurrency } from '@/lib/utils';
import { savingsAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface SavingsScreenProps {
  onNewGoalClick: () => void;
  onSettingsClick: () => void;
}

export const SavingsScreen = ({ onNewGoalClick, onSettingsClick }: SavingsScreenProps) => {
  const goals = useStore((s) => s.goals);
  const setGoals = useStore((s) => s.setGoals);
  const loading = useStore((s) => s.loading);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      const res = await savingsAPI.list();
      if (res?.data) setGoals(res.data);
    } catch (err) {
      console.error('Failed to load goals:', err);
    }
  };

  const handleDeposit = async (goalId: string) => {
    if (!depositAmount || depositLoading) return;
    setDepositLoading(true);
    const amt = parseFloat(depositAmount);
    try {
      await savingsAPI.deposit(goalId, amt);
    } catch {}
    // Always update store locally for demo
    setGoals(goals.map((g) =>
      g.id === goalId ? { ...g, currentAmount: Math.min(g.currentAmount + amt, g.targetAmount) } : g
    ));
    setDepositGoalId(null);
    setDepositAmount('');
    setDepositLoading(false);
  };

  const activeGoals = goals || [];
  const totalSaved = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const getGoalColor = (category: string): string => {
    const map: Record<string, string> = {
      electronics: 'var(--accent)',
      security:    'var(--success)',
      business:    'var(--warning)',
      personal:    'var(--danger)',
    };
    return map[category?.toLowerCase()] || 'var(--accent-2)';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-2 custom-scrollbar space-y-5">

        {/* Overview Card */}
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Portfolio Stash</p>
          <p className="text-[40px] font-mono-num font-bold text-[var(--text-primary)] leading-none tracking-tight">
            {formatCurrency(totalSaved, 'USDT')}
          </p>
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
              <span>Target Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <div className="bg-[var(--surface-3)] rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(overallProgress, 100)}%` }}
                className="accent-gradient h-full rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-1">Active Goals</p>

          {loading ? (
            <Skeleton className="h-[80px] w-full" />
          ) : activeGoals.length === 0 ? (
            <div className="py-12 text-center bg-[var(--surface)] border border-[var(--border)] border-dashed rounded-xl">
              <Target size={24} className="mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
              <p className="text-sm text-[var(--text-secondary)] font-medium">No active goals</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Lock USDT to beat inflation</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeGoals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const color = getGoalColor(goal.category);
                return (
                  <div key={goal.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}
                        >
                          <Target size={16} style={{ color }} />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[var(--text-primary)]">{goal.title}</p>
                          <p className="text-[11px] text-[var(--text-muted)]">
                            {formatCurrency(goal.currentAmount, 'USDT')} of {formatCurrency(goal.targetAmount, 'USDT')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[11px] font-mono-num font-semibold px-2 py-0.5 rounded-md"
                          style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
                        >
                          {Math.round(progress)}%
                        </span>
                        <button
                          onClick={() => setDepositGoalId(depositGoalId === goal.id ? null : goal.id)}
                          className="w-8 h-8 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20 flex items-center justify-center text-[var(--success)]"
                        >
                          <PlusCircle size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="bg-[var(--surface-3)] rounded-full h-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>

                    <AnimatePresence>
                      {depositGoalId === goal.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-3"
                        >
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Amount (USDT)"
                              value={depositAmount}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDepositAmount(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleDeposit(goal.id)}
                              disabled={!depositAmount || depositLoading}
                              className="flex-shrink-0"
                            >
                              {depositLoading ? <Loader2 size={14} className="animate-spin" /> : 'Add'}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="flex gap-3 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <span className="text-xl flex-shrink-0">🛡️</span>
          <div>
            <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-1">Inflation Shield</p>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Savings are stored in USDT (Digital Dollars). Your wealth stays stable even when the Naira fluctuates.
            </p>
          </div>
        </div>

      </div>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={onNewGoalClick}
        style={{ bottom: 'max(5.5rem, calc(env(safe-area-inset-bottom) + 5rem))' }}
        className="fixed right-4 w-14 h-14 rounded-2xl accent-gradient flex items-center justify-center shadow-[0_4px_20px_rgba(0,200,240,0.35)] z-30"
      >
        <Plus size={24} className="text-black" />
      </motion.button>
    </div>
  );
};
