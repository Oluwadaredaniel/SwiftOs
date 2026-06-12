'use client';

import { useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { useStore } from '@/store/useStore';
import { walletAPI, authAPI, transactionsAPI } from '@/lib/api';
import { DEMO_BALANCE, DEMO_TRANSACTIONS, DEMO_BILLS, DEMO_GOALS, DEMO_LINKS } from '@/lib/demoData';
import { motion, AnimatePresence } from 'framer-motion';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isReady } = useTelegram();
  const setUser = useStore((s) => s.setUser);
  const setBalances = useStore((s) => s.setBalances);
  const setTransactions = useStore((s) => s.setTransactions);
  const setBills = useStore((s) => s.setBills);
  const setGoals = useStore((s) => s.setGoals);
  const setLinks = useStore((s) => s.setLinks);
  const setLoading = useStore((s) => s.setLoading);

  useEffect(() => {
    if (!isReady) return;
    loadInitialData();
  }, [isReady]);

  const loadInitialData = async () => {
    setLoading(true);

    // Pre-seed demo data immediately so the UI is never blank
    setBalances(DEMO_BALANCE);
    setTransactions(DEMO_TRANSACTIONS);
    setBills(DEMO_BILLS);
    setGoals(DEMO_GOALS);
    setLinks(DEMO_LINKS);

    try {
      // Auth (silently fails → demo mode)
      const authRes = await authAPI.login();
      if (authRes.success && authRes.user) setUser(authRes.user);

      // Fetch real data, overwrite demo data if successful
      const [balanceRes, txRes] = await Promise.all([
        walletAPI.getBalance(),
        transactionsAPI.list({ limit: 50 }),
      ]);
      if (balanceRes?.data) setBalances(balanceRes.data);
      if (txRes?.data && txRes.data.length > 0) setTransactions(txRes.data);
    } catch {
      // Demo data already loaded above — nothing to do
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <AnimatePresence mode="wait">
        {!isReady ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-primary)]"
          >
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 rounded-3xl bg-[var(--accent)]/15 animate-pulse" />
              <div className="absolute inset-2 rounded-2xl accent-gradient shadow-[0_0_24px_rgba(0,200,240,0.35)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-black z-10 relative">S</span>
              </div>
            </div>
            <h1 className="text-xl font-semibold tracking-tight mb-1.5">SwiftyOS</h1>
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.25em]">Invisible Finance</p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
