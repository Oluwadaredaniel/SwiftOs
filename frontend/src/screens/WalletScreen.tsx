'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Zap, Info, HelpCircle, Send, Download, Copy, Check, Share2, TrendingUp, FileText } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useTelegram } from '@/hooks/useTelegram';
import { formatCurrency, copyToClipboard } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, BalanceCard, Skeleton } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { walletAPI, transactionsAPI } from '@/lib/api';
import { motion, Variants, AnimatePresence } from 'framer-motion';

const TX_STYLE: Record<string, { Icon: any; color: string; bg: string }> = {
  send:    { Icon: ArrowUpRight,   color: 'var(--danger)',    bg: 'rgba(255,59,107,0.13)' },
  receive: { Icon: ArrowDownLeft,  color: 'var(--success)',   bg: 'rgba(0,255,157,0.13)' },
  bill:    { Icon: Zap,            color: 'var(--accent)',    bg: 'rgba(0,217,255,0.13)' },
  convert: { Icon: ArrowRightLeft, color: 'var(--accent-2)',  bg: 'rgba(139,92,246,0.13)' },
  link:    { Icon: Share2,         color: 'var(--accent)',    bg: 'rgba(0,217,255,0.13)' },
  save:    { Icon: TrendingUp,     color: 'var(--warning)',   bg: 'rgba(255,179,71,0.13)' },
};
const TxBubble = ({ type }: { type: string }) => {
  const { Icon, color, bg } = TX_STYLE[type] || { Icon: FileText, color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.06)' };
  return (
    <div className="w-11 h-11 rounded-[14px] flex-shrink-0 flex items-center justify-center" style={{ background: bg }}>
      <Icon size={17} style={{ color }} />
    </div>
  );
};

export const WalletScreen = ({
  onSendClick,
  onReceiveClick,
  onConvertClick,
  onBillsClick,
  onSettingsClick,
  onViewAllTransactions,
}: {
  onSendClick: () => void;
  onReceiveClick: () => void;
  onConvertClick: () => void;
  onBillsClick: () => void;
  onSettingsClick: () => void;
  onViewAllTransactions: () => void;
}) => {
  const { haptic, tg } = useTelegram();
  const balances = useStore((state) => state.balances);
  const transactions = useStore((state) => state.transactions);
  const loading = useStore((state) => state.loading);
  const setBalances = useStore((state) => state.setBalances);
  const setTransactions = useStore((state) => state.setTransactions);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyAddress = async () => {
    if (!balances.usdt_address) return;
    await copyToClipboard(balances.usdt_address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

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
      console.error('Failed to refresh wallet data:', err);
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

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-32 px-6 pt-2 custom-scrollbar">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

          {/* Main Portfolio Header */}
          <motion.div variants={item}>
            {loading ? (
              <Skeleton className="h-64 w-full rounded-[48px]" />
            ) : (
              <BalanceCard
                variant="large"
                label="Total Portfolio Value"
                amount={formatCurrency(balances.ngn || 0, 'NGN')}
                currency="NGN"
              />
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item} className="space-y-3">
            {/* Send — hero */}
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleQuickAction(onSendClick)}
              className="w-full flex items-center justify-center gap-3 h-[72px] rounded-[28px] accent-gradient text-black font-display font-black shadow-[0_20px_40px_rgba(0,217,255,0.25)] border-0"
            >
              <div className="w-9 h-9 rounded-2xl bg-black/10 flex items-center justify-center">
                <Send size={20} />
              </div>
              <span className="text-[16px] uppercase tracking-wider">Send Money</span>
            </motion.button>

            {/* Secondary row */}
            <div className="grid grid-cols-3 gap-3">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction(onReceiveClick)}
                className="flex flex-col items-center justify-center gap-2 h-[72px] rounded-[28px] glass-strong border-white/10 text-[var(--text-primary)] font-display font-black"
              >
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[var(--success)]">
                  <Download size={18} />
                </div>
                <span className="text-[11px] uppercase tracking-wider">Receive</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction(onBillsClick)}
                className="flex flex-col items-center justify-center gap-2 h-[72px] rounded-[28px] glass-strong border-white/10 text-[var(--text-primary)] font-display font-black"
              >
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[var(--accent)]">
                  <Zap size={18} />
                </div>
                <span className="text-[11px] uppercase tracking-wider">Bills</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction(onConvertClick)}
                className="flex flex-col items-center justify-center gap-2 h-[72px] rounded-[28px] glass-strong border-white/10 text-[var(--text-primary)] font-display font-black"
              >
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[var(--accent)]">
                  <ArrowRightLeft size={18} />
                </div>
                <span className="text-[11px] uppercase tracking-wider">Swap</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Detailed Wallet Breakdown */}
          <motion.div variants={item} className="space-y-5">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">Digital Assets</span>
              <button onClick={() => setShowGuide(true)} className="flex items-center gap-1.5 text-[10px] font-display font-bold text-[var(--accent)] uppercase tracking-widest bg-[var(--accent)]/10 px-3 py-1.5 rounded-full border border-[var(--accent)]/20">
                <HelpCircle size={12} />
                <span>Guide</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {loading ? (
                <>
                  <Skeleton className="h-28 w-full rounded-[32px]" />
                  <Skeleton className="h-28 w-full rounded-[32px]" />
                </>
              ) : (
                <>
                  <BalanceCard
                    label="USDT Stablecoin (Escrow)"
                    amount={formatCurrency(balances.usdt || 0, 'USDT')}
                    currency="USDT"
                    variant="success"
                    subtext="Available for social links"
                  />
                  {balances.usdt_address && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleCopyAddress}
                      className="w-full mt-2 flex items-center justify-between px-5 py-3 glass rounded-[20px] border border-white/5 hover:border-[var(--accent)]/20 transition-all"
                    >
                      <span className="text-[11px] font-mono text-[var(--text-muted)] truncate mr-3">
                        {balances.usdt_address.slice(0, 14)}…{balances.usdt_address.slice(-6)}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] font-display font-black uppercase tracking-widest text-[var(--accent)] flex-shrink-0">
                        {copiedAddress ? <Check size={12} /> : <Copy size={12} />}
                        {copiedAddress ? 'Copied' : 'Copy Addr'}
                      </div>
                    </motion.button>
                  )}
                  <BalanceCard
                    label="US Dollar (Virtual Card)"
                    amount={formatCurrency(balances.usd || 0, 'USD')}
                    currency="USD"
                    variant="premium"
                    subtext="Used for international subs"
                  />
                </>
              )}
            </div>
          </motion.div>

          {/* Activity Section */}
          <motion.div variants={item} className="space-y-5">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">Recent Activity</span>
              {transactions && transactions.length > 0 && (
                <button onClick={onViewAllTransactions} className="text-[10px] font-display font-black text-[var(--accent)] uppercase tracking-[0.2em]">
                  History →
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-[32px]" />
                <Skeleton className="h-24 w-full rounded-[32px]" />
              </div>
            ) : !transactions || transactions.length === 0 ? (
              <Card className="py-20 text-center border-dashed border-white/5 bg-transparent rounded-[40px]">
                <div className="w-16 h-16 rounded-[24px] glass flex items-center justify-center mx-auto mb-5 shadow-2xl">
                  <ArrowUpRight size={24} className="text-[var(--text-muted)] opacity-30" />
                </div>
                <p className="text-[15px] text-[var(--text-secondary)] font-display font-bold">No activity yet</p>
                <p className="text-[11px] text-[var(--text-muted)] opacity-50 mt-1 uppercase tracking-[0.15em]">Perform a swap or pay a bill to start</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 3).map((tx, idx) => (
                    <Card key={tx.id} className="flex items-center justify-between py-4 px-5 rounded-2xl border-white/5 bg-white/[0.01] hover:bg-white/[0.04] active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4">
                      <TxBubble type={tx.type} />
                      <div>
                        <div className="text-[14px] font-semibold text-[var(--text-primary)] leading-tight mb-1">{tx.description}</div>
                        <div className="text-[11px] text-[var(--text-muted)] font-medium">
                          {new Date(tx.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className={`text-[15px] font-mono-num font-bold ${tx.type === 'bill' || tx.type === 'send' ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                      {tx.type === 'bill' || tx.type === 'send' ? '−' : '+'}
                      {formatCurrency(tx.amount, tx.currency as any)}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* User Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-strong w-full max-w-sm rounded-[48px] p-8 border-white/10 space-y-6"
            >
              <div className="flex justify-between items-start">
                <div className="w-16 h-16 rounded-3xl accent-gradient flex items-center justify-center text-black">
                  <Info size={32} />
                </div>
                <button onClick={() => setShowGuide(false)} className="p-2 rounded-xl glass border-white/5 text-[var(--text-secondary)]">✕</button>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-display font-black">SwiftyOS Guide</h3>
                <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
                  Welcome to the future of African finance. Here's how to navigate your new OS:
                </p>
              </div>
              <div className="space-y-4">
                {[
                  { icon: '🔗', title: 'Swifty Links', desc: 'Send money to any Telegram user via a simple link.' },
                  { icon: '⚡', title: 'Instant Bills', desc: 'Pay utilities and buy data with zero fees.' },
                  { icon: '🔄', title: 'Smart Swap', desc: 'Convert between NGN, USD, and USDT instantly.' },
                  { icon: '🛡️', title: 'Escrow', desc: 'Your funds are always safe until the link is claimed.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="text-xl">{item.icon}</div>
                    <div>
                      <div className="text-[13px] font-display font-extrabold">{item.title}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="lg" className="w-full rounded-[24px]" onClick={() => setShowGuide(false)}>Got it!</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
