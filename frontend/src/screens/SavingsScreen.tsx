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

import { Plus, Target, ShieldCheck, Heart, Briefcase, Zap, ChevronRight } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { formatCurrency } from '@/lib/utils';
import { savingsAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export const SavingsScreen = ({ onNewGoalClick, onSettingsClick }: SavingsScreenProps) => {
  const goals = useStore((state) => state.goals);
  const setGoals = useStore((state) => state.setGoals);
  const loading = useStore((state) => state.loading);

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

  const activeGoals = goals || [];
  const totalSaved = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const getGoalIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'electronics': return <Zap className="text-[var(--accent)]" />;
      case 'security': return <ShieldCheck className="text-[var(--success)]" />;
      case 'business': return <Briefcase className="text-[var(--warning)]" />;
      case 'personal': return <Heart className="text-[var(--danger)]" />;
      default: return <Target className="text-[var(--accent-2)]" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-40 px-6 pt-2 custom-scrollbar">
        <div className="space-y-9">

          {/* Wealth Overview Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong relative overflow-hidden rounded-[48px] p-9 text-center border-white/10"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[var(--success)]/10 blur-[100px] opacity-60" />
            <div className="relative z-10">
              <div className="text-[11px] font-display uppercase tracking-[0.4em] text-[var(--text-secondary)] mb-5 opacity-60 font-black">Portfolio Stash</div>
              <div className="text-5xl font-mono-num font-black text-gradient mb-7 tracking-tighter">
                {formatCurrency(totalSaved, 'USDT')}
              </div>

              <div className="space-y-3 max-w-[200px] mx-auto">
                <div className="flex justify-between items-center text-[10px] font-display uppercase tracking-[0.2em] text-[var(--text-muted)] font-black">
                  <span>Target Reach</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <div className="bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(overallProgress, 100)}%` }}
                    className="accent-gradient h-full rounded-full shadow-[0_0_15px_var(--accent)]"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Goals Section */}
          <div className="space-y-5">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-display uppercase tracking-[0.3em] text-[var(--text-secondary)] font-black opacity-60">Active Goals</span>
              <button className="text-[10px] font-display font-black text-[var(--accent)] uppercase tracking-[0.2em]">Manage →</button>
            </div>

            {loading ? (
              <Skeleton className="h-32 w-full rounded-[40px]" />
            ) : activeGoals.length === 0 ? (
              <Card className="py-24 text-center border-dashed border-white/5 bg-transparent rounded-[40px]">
                <div className="w-16 h-16 rounded-[24px] glass flex items-center justify-center mx-auto mb-5">
                  <Target size={24} className="text-[var(--text-muted)] opacity-30" />
                </div>
                <p className="text-[15px] text-[var(--text-secondary)] font-display font-bold">No active goals</p>
                <p className="text-[11px] text-[var(--text-muted)] opacity-50 mt-1 uppercase tracking-[0.15em]">Lock USDT to beat inflation</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeGoals.map((goal, idx) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="p-7 rounded-[36px] border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all group">
                        <div className="flex items-start justify-between mb-5">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-[18px] glass flex items-center justify-center text-xl bg-white/5 group-hover:scale-110 transition-transform">
                              {getGoalIcon(goal.category)}
                            </div>
                            <div>
                              <div className="text-[16px] font-display font-black text-[var(--text-primary)] leading-none mb-1.5">{goal.title}</div>
                              <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest font-black opacity-60">
                                {formatCurrency(goal.currentAmount, 'USDT')} of {formatCurrency(goal.targetAmount, 'USDT')}
                              </div>
                            </div>
                          </div>
                          <div className="px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[11px] font-mono-num font-black text-[var(--accent)]">
                            {Math.round(progress)}%
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            className="accent-gradient h-full rounded-full"
                          />
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Automation Rules */}
          <div className="glass-strong rounded-[40px] p-8 space-y-6 border-white/5 bg-white/[0.01]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--warning)]/10 flex items-center justify-center text-[var(--warning)]">
                  <Zap size={20} fill="currentColor" />
                </div>
                <h4 className="text-[14px] font-display font-black text-[var(--text-primary)] uppercase tracking-wider">Auto-Save</h4>
              </div>
              <ChevronRight size={18} className="text-[var(--text-muted)]" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-[var(--success)]/30 transition-all cursor-pointer">
                <div className="space-y-0.5">
                   <div className="text-[13px] font-display font-black">Round-ups</div>
                   <div className="text-[10px] text-[var(--text-muted)]">Save change from bills</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-display font-black text-[var(--success)] uppercase tracking-[0.2em] bg-[var(--success)]/10 px-3 py-1.5 rounded-xl border border-[var(--success)]/20">Active</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer">
                <div className="space-y-0.5">
                   <div className="text-[13px] font-display font-black">Smart Recurring</div>
                   <div className="text-[10px] text-[var(--text-muted)]">Weekly USDT deposits</div>
                </div>
                <span className="text-[10px] font-display font-black text-[var(--text-muted)] uppercase tracking-[0.2em] bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">Paused</span>
              </div>
            </div>
          </div>

          {/* Educational Insight */}
          <div className="px-2 py-4">
             <div className="glass p-5 rounded-[32px] border-dashed border-white/10 flex gap-4 items-start">
               <div className="text-2xl pt-1">🛡️</div>
               <div className="space-y-1">
                 <div className="text-[13px] font-display font-bold text-[var(--text-primary)]">Inflation Shield</div>
                 <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                   Your savings are stored in USDT (Digital Dollars). This means your wealth doesn't lose value even if the Naira fluctuates.
                 </p>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-32 right-6">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onNewGoalClick}
          className="rounded-[28px] w-18 h-18 flex items-center justify-center shadow-[0_20px_50px_rgba(0,217,255,0.4)] accent-gradient border-0"
        >
          <Plus size={32} className="text-black" />
        </motion.button>
      </div>
    </div>
  );
};
