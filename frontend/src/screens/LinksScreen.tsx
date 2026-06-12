'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Share2, ShieldCheck, Loader2, ArrowDownToLine } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Skeleton, Input } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { formatCurrency, copyToClipboard } from '@/lib/utils';
import { linksAPI } from '@/lib/api';
import { motion } from 'framer-motion';

interface LinksScreenProps {
  onCreateLinkClick: () => void;
  onSettingsClick: () => void;
}

export const LinksScreen = ({ onCreateLinkClick, onSettingsClick }: LinksScreenProps) => {
  const links = useStore((s) => s.links);
  const setLinks = useStore((s) => s.setLinks);
  const balances = useStore((s) => s.balances);
  const loading = useStore((s) => s.loading);
  const [copied, setCopied] = useState<string | null>(null);
  const [claimToken, setClaimToken] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimResult, setClaimResult] = useState<string | null>(null);

  useEffect(() => { loadLinks(); }, []);

  const loadLinks = async () => {
    try {
      const res = await linksAPI.list();
      if (res?.data) setLinks(res.data);
    } catch (err) {
      console.error('Failed to load links:', err);
    }
  };

  const activeLinks = links?.filter((l) => l.status === 'active') || [];
  const usdtRate = balances.rates?.usdt_ngn || 1450;

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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-28 px-4 pt-2 custom-scrollbar space-y-5">

        {/* Info Card */}
        <div className="bg-[var(--surface-2)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-[17px] font-semibold text-[var(--text-primary)] mb-1.5">Social Escrow</p>
          <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
            Lock USDT into a secure link. Send to any Telegram user — they claim, we unlock. Zero friction.
          </p>
          <div className="flex gap-2 mt-4">
            <span className="px-2.5 py-1 rounded-lg bg-[var(--success)]/10 text-[var(--success)] text-[10px] font-semibold border border-[var(--success)]/20">Atomic Claim</span>
            <span className="px-2.5 py-1 rounded-lg bg-[var(--surface-3)] text-[var(--text-muted)] text-[10px] font-semibold border border-[var(--border)]">On-chain</span>
          </div>
        </div>

        {/* Active Links */}
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-1">My Active Links</p>

          {loading ? (
            <Skeleton className="h-[100px] w-full" />
          ) : activeLinks.length === 0 ? (
            <div className="py-12 text-center bg-[var(--surface)] border border-[var(--border)] border-dashed rounded-xl">
              <Share2 size={24} className="mx-auto mb-3 text-[var(--text-muted)] opacity-40" />
              <p className="text-sm text-[var(--text-secondary)] font-medium">No active links</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Generate a link to share value</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeLinks.map((link) => (
                <div key={link.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[22px] font-mono-num font-bold text-[var(--text-primary)]">
                        {formatCurrency(link.amount, 'NGN')}
                      </p>
                      <p className="text-[11px] text-[var(--accent)] mt-0.5">
                        ≈ {formatCurrency(link.amount / usdtRate, 'USDT')}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/20 flex items-center justify-center">
                      <ShieldCheck size={18} className="text-[var(--success)]" />
                    </div>
                  </div>

                  {link.note && (
                    <p className="mb-3 text-[12px] text-[var(--text-secondary)] italic bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2">
                      "{link.note}"
                    </p>
                  )}

                  <button
                    onClick={() => handleCopy(`https://t.me/Swiftos_bot/app?startapp=claim_${link.id}`, link.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] text-[13px] font-medium text-[var(--text-primary)] active:opacity-70 transition-opacity"
                  >
                    {copied === link.id ? <Check size={15} className="text-[var(--success)]" /> : <Share2 size={15} />}
                    {copied === link.id ? 'Copied!' : 'Share Link'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Claim a Link */}
        <div className="space-y-2.5">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-1">Claim a Link</p>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20 flex items-center justify-center flex-shrink-0">
                <ArrowDownToLine size={16} className="text-[var(--success)]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[var(--text-primary)]">Redeem a payment link</p>
                <p className="text-[11px] text-[var(--text-muted)]">Enter the claim token sent to you</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Paste token here..."
                value={claimToken}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClaimToken(e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleClaim}
                disabled={!claimToken.trim() || claimLoading}
                className="flex-shrink-0"
              >
                {claimLoading ? <Loader2 size={14} className="animate-spin" /> : 'Claim'}
              </Button>
            </div>
            {claimResult && (
              <p className={`text-[11px] font-medium px-3 py-2 rounded-lg ${
                claimResult === 'success'
                  ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20'
                  : 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'
              }`}>
                {claimResult === 'success' ? '✓ Link claimed successfully!' : claimResult}
              </p>
            )}
          </div>
        </div>

      </div>

      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={onCreateLinkClick}
        style={{ bottom: 'max(5.5rem, calc(env(safe-area-inset-bottom) + 5rem))' }}
        className="fixed right-4 w-14 h-14 rounded-2xl accent-gradient flex items-center justify-center shadow-[0_4px_20px_rgba(0,200,240,0.35)] z-30"
      >
        <Plus size={24} className="text-black" />
      </motion.button>
    </div>
  );
};
