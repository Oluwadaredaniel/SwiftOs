'use client';

import { useState, useEffect } from 'react';
import { Plus, Copy, Check } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { formatCurrency, formatDate, copyToClipboard } from '@/lib/utils';
import { linksAPI } from '@/lib/api';

interface LinksScreenProps {
  onCreateLinkClick: () => void;
  onSettingsClick: () => void;
}

export const LinksScreen = ({ onCreateLinkClick, onSettingsClick }: LinksScreenProps) => {
  const links = useStore((state) => state.links);
  const setLinks = useStore((state) => state.setLinks);
  const [copied, setCopied] = useState<string | null>(null);

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

  const activeLinks = links.filter((l) => l.status === 'active');
  const claimedLinks = links.filter((l) => l.status === 'claimed');

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <Header onSettingsClick={onSettingsClick} />

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-5 space-y-6">
          <div>
            <div className="text-xs font-display uppercase tracking-[0.18em] text-[var(--text-secondary)] mb-4">Active Links</div>
            {activeLinks.length === 0 ? (
              <Card className="py-8 text-center">
                <p className="text-sm text-[var(--text-muted)]">No active links</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {activeLinks.map((link) => (
                  <Card key={link.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-mono-num font-semibold text-[var(--text-primary)]">{formatCurrency(link.amount, 'NGN')}</div>
                      <span className="text-[11px] font-display font-bold bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30 px-2.5 py-1 rounded-full">Active</span>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">Created: {formatDate(link.expiryDate)}</div>
                    {link.note && <div className="text-xs text-[var(--text-primary)]">"{link.note}"</div>}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleCopy(`swiftyos://claim/${link.id}`, link.id)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {copied === link.id ? <Check size={16} /> : <Copy size={16} />}
                      {copied === link.id ? 'Copied' : 'Copy Link'}
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-display font-bold text-[var(--text-secondary)] uppercase tracking-[0.18em] mb-3">Claimed</h3>
            {claimedLinks.length === 0 ? (
              <Card className="py-4 text-center">
                <p className="text-xs text-[var(--text-muted)]">No claimed links</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {claimedLinks.map((link) => (
                  <Card key={link.id} className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-mono-num font-semibold text-[var(--text-primary)]">{formatCurrency(link.amount, 'NGN')}</div>
                      <div className="text-xs text-[var(--text-secondary)]">Claimed by {link.claimedBy}</div>
                    </div>
                    <span className="text-[11px] font-display font-bold bg-[var(--text-muted)]/20 text-[var(--text-secondary)] border border-white/10 px-2.5 py-1 rounded-full">✓ Claimed</span>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-24 right-4">
        <Button size="lg" onClick={onCreateLinkClick} className="rounded-full w-14 h-14 flex items-center justify-center">
          <Plus size={24} />
        </Button>
      </div>
    </div>
  );
};
