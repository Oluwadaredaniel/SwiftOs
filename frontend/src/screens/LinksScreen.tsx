'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Share2, ShieldCheck, Loader2, ArrowDownToLine } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Card, Skeleton, Input } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { formatCurrency, copyToClipboard } from '@/lib/utils';
import { linksAPI } from '@/lib/api';
import { motion } from 'framer-motion';

interface LinksScreenProps {
  onCreateLinkClick: () => void;
  onSettingsClick: () => void;
}

export const LinksScreen = ({ onCreateLinkClick, onSettingsClick }: LinksScreenProps) => {
  const links = useStore((state) => state.links);
  const setLinks = useStore((state) => state.setLinks);
  const balances = useStore((state) => state.balances);
  const loading = useStore((state) => state.loading);
  const [copied, setCopied] = useState<string | null>(null);
  const [claimToken, setClaimToken] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimResult, setClaimResult] = useState<string | null>(null);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const res = await linksAPI.list();
      if (res?.data) setLinks(res.data);
    } catch (err) {
      console.error('Failed to load links:', err);
    }
  };

  const activeLinks = links?.filter((l) => l.status === 'active') || [];

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClaim = async () => {
    if (!claimToken.trim() || claimLoading) return;
    setClaimLoading(true);
    setClaimResult(null);
    try {
      await linksAPI.claim(claimToken.trim());
      setClaimResult('success');
      setClaimToken('');
      await loadLinks();
    } catch (err: any) {
      setClaimResult(err.message || 'Claim failed');
    } finally {
      setClaimLoading(false);
    }
  };

  const usdtRate = balances.rates?.usdt_ngn || 1450;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] overflow-hidden">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-40 px-6 pt-2 custom-scrollbar">
        <div className="space-y-10">

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-strong relative overflow-hidden rounded-[48px] p-8 border-white/10 bg-white/[0.01]"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-[80px]" />
            <h3 className="text-2xl font-display font-black text-[var(--text-primary)] mb-3 tracking-tighter">Social Escrow</h3>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed opacity-80 font-medium">
              Lock USDT into a secure link. Send it to any Telegram user—they claim, we unlock. Zero friction.
            </p>
            <div className="mt-6 flex items-center gap-3">
               <div className="px-3 py-1.5 rounded-xl bg-[var(--success)]/10 text-[var(--success)] text-[10px] font-display font-black uppercase tracking-widest border border-[var(--success)]/20">
                 Atomic Claim
               </div>
               <div className="px-3 py-1.5 rounded-xl bg-white/5 text-[var(--text-muted)] text-[10px] font-display font-black uppercase tracking-widest border border-white/5">
                 100% On-chain
               </div>
            </div>
          </motion.div>

          <div className="space-y-5">
            <div className="px-2">
              <span className="text-[11px] font-display uppercase tracking-[0.3em] text-[var(--text-secondary)] font-black opacity-60">My Active Links</span>
            </div>

            {loading ? (
              <Skeleton className="h-44 w-full rounded-[40px]" />
            ) : activeLinks.length === 0 ? (
              <Card className="py-24 text-center border-dashed border-white/5 bg-transparent rounded-[40px]">
                <div className="w-16 h-16 rounded-[24px] glass flex items-center justify-center mx-auto mb-5 shadow-2xl">
                  <Share2 size={24} className="text-[var(--text-muted)] opacity-30" />
                </div>
                <p className="text-[15px] text-[var(--text-secondary)] font-display font-bold">No active links</p>
                <p className="text-[11px] text-[var(--text-muted)] opacity-50 mt-1 uppercase tracking-[0.15em]">Generate a link to share value</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeLinks.map((link) => (
                  <Card key={link.id} className="p-7 rounded-[36px] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all">
                    <div className="flex items-center justify-between mb-5">
                      <div className="space-y-1">
                        <div className="text-[26px] font-mono-num font-black text-[var(--text-primary)] tracking-tighter">
                          {formatCurrency(link.amount, 'NGN')}
                        </div>
                        <div className="text-[10px] text-[var(--accent)] font-display font-black uppercase tracking-[0.2em] opacity-80">
                          ≈ {formatCurrency(link.amount / usdtRate, 'USDT')}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-[18px] glass flex items-center justify-center text-[var(--success)] shadow-lg border-white/5">
                        <ShieldCheck size={24} />
                      </div>
                    </div>

                    {link.note && (
                      <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5 italic text-[13px] text-[var(--text-secondary)]">
                        "{link.note}"
                      </div>
                    )}

                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={() => handleCopy(`https://t.me/Swiftos_bot/app?startapp=claim_${link.id}`, link.id)}
                      className="w-full flex items-center justify-center gap-3 rounded-[24px] border-white/5 h-14 bg-white/5 hover:bg-white/10 active:scale-95 transition-all"
                    >
                      {copied === link.id ? <Check size={20} className="text-[var(--success)]" /> : <Share2 size={20} />}
                      <span className="text-[12px] uppercase tracking-[0.2em] font-black">{copied === link.id ? 'Copied' : 'Share Link'}</span>
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>
          {/* Claim a Link */}
          <div className="space-y-4">
            <div className="px-2">
              <span className="text-[11px] font-display uppercase tracking-[0.3em] text-[var(--text-secondary)] font-black opacity-60">Claim a Link</span>
            </div>
            <div className="glass-strong rounded-[36px] p-6 space-y-4 border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--success)]/10 flex items-center justify-center text-[var(--success)] flex-shrink-0">
                  <ArrowDownToLine size={20} />
                </div>
                <div>
                  <div className="text-[13px] font-display font-black text-[var(--text-primary)]">Redeem a payment link</div>
                  <div className="text-[11px] text-[var(--text-muted)]">Enter the claim token sent to you</div>
                </div>
              </div>
              <div className="flex gap-3">
                <Input
                  placeholder="Paste token here..."
                  value={claimToken}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClaimToken(e.target.value)}
                  className="flex-1 text-sm h-11 px-4"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClaim}
                  disabled={!claimToken.trim() || claimLoading}
                  className="h-11 px-5 rounded-[20px] accent-gradient text-black text-[12px] font-display font-black uppercase tracking-widest disabled:opacity-40 flex-shrink-0 flex items-center gap-2"
                >
                  {claimLoading ? <Loader2 size={14} className="animate-spin" /> : 'Claim'}
                </motion.button>
              </div>
              {claimResult && (
                <div className={`text-[11px] font-display font-black px-3 py-2 rounded-xl ${
                  claimResult === 'success'
                    ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20'
                    : 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'
                }`}>
                  {claimResult === 'success' ? '✓ Link claimed successfully!' : claimResult}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="fixed bottom-32 right-6">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onCreateLinkClick}
          className="rounded-[28px] w-18 h-18 flex items-center justify-center shadow-[0_20px_50px_rgba(0,217,255,0.4)] accent-gradient border-0"
        >
          <Plus size={32} className="text-black" />
        </motion.button>
      </div>
    </div>
  );
};
