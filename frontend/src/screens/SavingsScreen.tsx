'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { formatCurrency } from '@/lib/utils';
import { savingsAPI } from '@/lib/api';

interface SavingsScreenProps {
  onNewGoalClick: () => void;
  onSettingsClick: () => void;
}

export const SavingsScreen = ({ onNewGoalClick, onSettingsClick }: SavingsScreenProps) => {
  const goals = useStore((state) => state.goals);
  const setGoals = useStore((state) => state.setGoals);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const res = await savingsAPI.list();
      if (res?.data) setGoals(res.data);
    } catch (err) {
      console.error('Failed to load goals:', err);
    }
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="flex flex-col h-full">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-5 space-y-6">
          <div className="glass relative overflow-hidden rounded-3xl p-6 text-[var(--text-primary)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--success)]/15 blur-3xl" />
            <div className="relative">
              <div className="text-[11px] font-display uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-3">Total Saved</div>
              <div className="text-4xl font-mono-num font-semibold text-gradient mb-4">{formatCurrency(totalSaved, 'USDT')}</div>
              <div className="flex items-end gap-2 text-xs">
                <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div className="accent-gradient h-full transition-all" style={{ width: `${Math.min(overallProgress, 100)}%` }} />
                </div>
                <span className="text-[var(--text-secondary)] font-mono-num">{Math.round(overallProgress)}%</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-display uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-4">Active Goals</div>
            {goals.length === 0 ? (
              <Card className="py-8 text-center">
                <p className="text-sm text-[var(--text-muted)]">No savings goals yet</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {goals.map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  return (
                    <Card key={goal.id} className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-display font-bold text-[var(--text-primary)]">{goal.title}</div>
                          <div className="text-xs text-[var(--text-secondary)] font-mono-num">
                            {formatCurrency(goal.currentAmount, 'USDT')} / {formatCurrency(goal.targetAmount, 'USDT')}
                          </div>
                        </div>
                        <span className="text-sm font-mono-num font-semibold text-[var(--accent)]">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="accent-gradient h-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass rounded-2xl p-4 space-y-2 !border-[var(--warning)]/30">
            <h4 className="text-sm font-display font-bold text-[var(--warning)]">Automation Rules</h4>
            <div className="text-xs text-[var(--text-primary)] space-y-2">
              <div className="flex items-center justify-between">
                <span>🔄 Round-ups (Bills)</span>
                <span className="text-[var(--success)]">ON</span>
              </div>
              <div className="flex items-center justify-between">
                <span>📅 Weekly Deposit</span>
                <span className="text-[var(--success)]">ON</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-24 right-4">
        <Button size="lg" onClick={onNewGoalClick} className="rounded-full w-14 h-14 flex items-center justify-center">
          <Plus size={24} />
        </Button>
      </div>
    </div>
  );
};
