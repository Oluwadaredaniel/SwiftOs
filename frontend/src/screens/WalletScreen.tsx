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
    <div className="flex flex-col h-full">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-28">
        <motion.div variants={container} initial="hidden" animate="show" className="p-5 space-y-6">
          <motion.div variants={item} className="space-y-4">
            <div className="font-display uppercase tracking-[0.18em] text-xs text-[var(--text-secondary)] px-1">
              Your Wallets
            </div>

            {loading ? (
              <>
                <Skeleton className="h-32 w-full rounded-[32px]" />
                <Skeleton className="h-32 w-full rounded-[32px]" />
                <Skeleton className="h-32 w-full rounded-[32px]" />
              </>
            ) : (
              <div className="space-y-4">
                <BalanceCard
                  label="Naira Wallet"
                  amount={formatCurrency(balances.ngn, 'NGN')}
                  currency="NGN"
                  subtext="Daily spending"
                />
                <BalanceCard
                  label="Dollar Wallet"
                  amount={formatCurrency(balances.usd, 'USD')}
                  currency="USD"
                  variant="premium"
                  subtext="Stability savings"
                />
                <BalanceCard
                  label="USDT Portfolio"
                  amount={formatCurrency(balances.usdt, 'USDT')}
                  currency="USDT"
                  variant="success"
                  subtext="Global & Social"
                />
              </div>
            )}
          </motion.div>

          <motion.div variants={item} className="grid grid-cols-4 gap-3">
            {[
              { icon: ArrowUpRight, label: 'Send', color: 'var(--accent)', onClick: onSendClick },
              { icon: ArrowDownLeft, label: 'Receive', color: 'var(--warning)', onClick: onReceiveClick },
              { icon: ArrowRightLeft, label: 'Swap', color: 'var(--accent-2)', onClick: onConvertClick },
              { icon: Zap, label: 'Bills', color: 'var(--success)', onClick: onBillsClick },
            ].map((action, i) => (
              <motion.button
                key={i}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction(action.onClick)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center transition-all group-hover:border-[var(--accent)]/50 group-hover:bg-white/10">
                  <action.icon size={22} style={{ color: action.color }} />
                </div>
                <span className="text-[11px] font-display font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </motion.div>

          <motion.div variants={item} className="space-y-4">
            <div className="font-display uppercase tracking-[0.18em] text-xs text-[var(--text-secondary)] px-1">
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
                    <Card className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-[var(--glass-border)] flex items-center justify-center text-lg">
                          {tx.type === 'send' ? '📤' : tx.type === 'receive' ? '📥' : tx.type === 'bill' ? '📱' : '🔄'}
                        </div>
                        <div>
                          <div className="text-sm font-display font-bold text-[var(--text-primary)]">{tx.description}</div>
                          <div className="text-xs text-[var(--text-muted)] font-mono-num">
                            {new Date(tx.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm font-mono-num font-semibold ${tx.type === 'send' ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
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
