'use client';

import { useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { useStore } from '@/store/useStore';
import { walletAPI, authAPI } from '@/lib/api';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isReady } = useTelegram();
  const setUser = useStore((state) => state.setUser);
  const setBalances = useStore((state) => state.setBalances);
  const setLoading = useStore((state) => state.setLoading);
  const setError = useStore((state) => state.setError);

  useEffect(() => {
    if (!isReady) return;

    loadInitialData();
  }, [isReady]);

  const loadInitialData = async () => {
    setLoading(true);
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
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Initialization failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return <>{children}</>;
};
