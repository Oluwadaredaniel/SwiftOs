'use client';

import { useEffect } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { useStore } from '@/store/useStore';
import { walletAPI } from '@/lib/api';

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isReady } = useTelegram();
  const setUser = useStore((state) => state.setUser);
  const setBalances = useStore((state) => state.setBalances);
  const setLoading = useStore((state) => state.setLoading);
  const setError = useStore((state) => state.setError);

  useEffect(() => {
    if (!isReady) return;

    if (user) {
      setUser(user);
    }
    loadInitialData();
  }, [isReady, user, setUser]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [balanceRes] = await Promise.all([
        walletAPI.getBalance(),
      ]);

      if (balanceRes?.data) {
        setBalances(balanceRes.data);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  return <>{children}</>;
};
