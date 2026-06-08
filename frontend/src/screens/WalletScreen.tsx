'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Zap } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useTelegram } from '@/hooks/useTelegram';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, BalanceCard, Skeleton } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { walletAPI, transactionsAPI } from '@/lib/api';
import { motion, Variants } from 'framer-motion';

interface WalletScreenProps {
  onSendClick: () => void;
  onReceiveClick: () => void;
  onConvertClick: () => void;
  onBillsClick: () => void;
  onSettingsClick: () => void;
  onViewAllTransactions: () => void;
}

export const WalletScreen = ({
  onSendClick,
  onReceiveClick,
  onConvertClick,
  onBillsClick,
  onSettingsClick,
  onViewAllTransactions,
}: WalletScreenProps) => {
  const { haptic } = useTelegram();
  const balances = useStore((state) => state.balances);
  const transactions = useStore((state) => state.transactions);
  const loading = useStore((state) => state.loading);
  const setBalances = useStore((state) => state.setBalances);
  const setTransactions = useStore((state) => state.setTransactions);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    try {
      const [balanceRes, txRes] = await Promise.all([
        walletAPI.getBalance(),
        transactionsAPI.list({ limit: 3 }),
      ]);

      if (balanceRes?.data) setBalances(balanceRes.data);
      if (txRes?.data) setTransactions(txRes.data);
    } catch (err) {
      console.error('Failed to refresh:', err);
    }
  };

  const handleQuickAction = (action: () => void) => {
    haptic('light');
    action();
  };

  const container: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };

  const item: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } } };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)]">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-24">
        <motion.div variants={container} initial="hidden" animate="show" className="p-5 space-y-6">
          <motion.div variants={item} className="space-y-4">
            <div className="font-display uppercase tracking-widest text-xs text-[var(--text-secondary)] px-1">
              Your Wallets
            </div>

            {loading ? (
              <>
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-28 w-full rounded-lg" />
              </>
            ) : (
              <div className="space-y-3">
                <BalanceCard
                  label="Naira Balance"
                  amount={formatCurrency(balances.ngn, 'NGN')}
                  currency="NGN"
                />
                <BalanceCard
                  label="Dollar Balance"
                  amount={formatCurrency(balances.usd, 'USD')}
                  currency="USD (Virtual)"
                />
                <BalanceCard
                  label="Crypto Balance"
                  amount={formatCurrency(balances.usdt, 'USDT')}
                  currency="USDT"
                />
              </div>
            )}
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-2 gap-3">
            <motion.div whileHover={{ y: -4 }} whileTap={{ y: 0 }}>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleQuickAction(onSendClick)}
                className="flex flex-col items-center gap-2 h-28 w-full"
              >
                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                  <ArrowUpRight size={28} className="text-[var(--accent)]" />
                </motion.div>
                <span className="font-display">Send</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} whileTap={{ y: 0 }}>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleQuickAction(onReceiveClick)}
                className="flex flex-col items-center gap-2 h-28 w-full"
              >
                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                  <ArrowDownLeft size={28} className="text-[var(--warning)]" />
                </motion.div>
                <span className="font-display">Receive</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} whileTap={{ y: 0 }}>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleQuickAction(onConvertClick)}
                className="flex flex-col items-center gap-2 h-28 w-full"
              >
                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                  <ArrowRightLeft size={28} className="text-[var(--accent)]" />
                </motion.div>
                <span className="font-display">Convert</span>
              </Button>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} whileTap={{ y: 0 }}>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleQuickAction(onBillsClick)}
                className="flex flex-col items-center gap-2 h-28 w-full"
              >
                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                  <Zap size={28} className="text-[var(--success)]" />
                </motion.div>
                <span className="font-display">Bills</span>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div variants={item} className="space-y-4">
            <div className="font-display uppercase tracking-widest text-xs text-[var(--text-secondary)] px-1">
              Recent Activity
            </div>

            {transactions.length === 0 ? (
              <Card className="py-12 text-center">
                <p className="text-sm text-[var(--text-muted)]">No transactions yet</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {transactions.slice(0, 3).map((tx, idx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="flex items-center justify-between hover:shadow-[0_0_20px_rgba(0,217,255,0.1)]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-[var(--bg-tertiary)] flex items-center justify-center text-lg">
                          {tx.type === 'send' ? '📤' : tx.type === 'receive' ? '📥' : tx.type === 'bill' ? '📱' : '🔄'}
                        </div>
                        <div>
                          <div className="text-sm font-display font-bold text-[var(--text-primary)]">{tx.description}</div>
                          <div className="text-xs text-[var(--text-muted)] font-display">
                            {new Date(tx.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm font-display font-bold ${tx.type === 'send' ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                        {tx.type === 'send' ? '−' : '+'}
                        {formatCurrency(tx.amount, tx.currency as any)}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {transactions.length > 0 && (
              <Button variant="ghost" size="md" onClick={onViewAllTransactions} className="w-full">
                View All Transactions →
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
