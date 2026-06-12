'use client';

import { useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { useStore } from '@/store/useStore';
import { walletAPI, authAPI } from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isReady, isTelegram, tg } = useTelegram();
  const setUser = useStore((state) => state.setUser);
  const setBalances = useStore((state) => state.setBalances);
  const setLoading = useStore((state) => state.setLoading);
  const error = useStore((state) => state.error);
  const setError = useStore((state) => state.setError);

  useEffect(() => {
    if (!isReady) return;
    loadInitialData();
  }, [isReady]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Step 1: Perform handshake/auth with backend
      const authRes = await authAPI.login();
      if (authRes.success) {
        setUser(authRes.user);
      }

      // Step 2: Fetch balances
      const balanceRes = await walletAPI.getBalance();
      if (balanceRes?.data) {
        setBalances(balanceRes.data);
      }
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      setError(err.message || 'Initialization failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
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
              <div className="absolute inset-0 rounded-3xl bg-[var(--accent)]/20 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--accent)] to-[var(--accent-2)] shadow-[0_0_20px_rgba(0,183,255,0.4)]" />
              </div>
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight mb-2">SwiftyOS</h1>
            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-[0.2em]">Invisible Finance</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[var(--bg-primary)]"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--danger)]/10 flex items-center justify-center mb-6 text-[var(--danger)]">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-[var(--text-muted)] text-center mb-8 max-w-[280px]">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 rounded-2xl bg-white/[0.05] border border-[var(--glass-border)] text-sm font-bold"
            >
              Try Again
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

