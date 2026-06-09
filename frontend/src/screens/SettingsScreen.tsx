'use client';

import { useTelegram } from '@/hooks/useTelegram';
import { useStore } from '@/store/useStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { ChevronRight } from 'lucide-react';

interface SettingsScreenProps {
  onBackClick: () => void;
}

export const SettingsScreen = ({ onBackClick }: SettingsScreenProps) => {
  const { user, close } = useTelegram();
  const appUser = useStore((state) => state.user);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      close?.();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-[var(--bg-primary)]/40 backdrop-blur-xl border-b border-[var(--glass-border)] px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <Button size="sm" variant="secondary" onClick={onBackClick}>
          ← Back
        </Button>
        <h2 className="text-lg font-display font-bold text-[var(--text-primary)]">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-xs font-display font-bold text-[var(--text-secondary)] uppercase tracking-[0.18em] mb-3">Profile</h3>
            <Card className="space-y-3">
              <div>
                <div className="text-xs text-[var(--text-secondary)]">Username</div>
                <div className="text-sm font-display font-bold text-[var(--text-primary)]">@{user?.username || 'anonymous'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">Telegram ID</div>
                <div className="text-sm font-mono-num font-semibold text-[var(--text-primary)]">{user?.id}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">Name</div>
                <div className="text-sm font-display font-bold text-[var(--text-primary)]">
                  {user?.first_name} {user?.last_name || ''}
                </div>
              </div>
            </Card>
          </div>

          <div>
            <h3 className="text-xs font-display font-bold text-[var(--text-secondary)] uppercase tracking-[0.18em] mb-3">Security</h3>
            <div className="space-y-2">
              <Card className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--text-primary)]">Two-Factor Auth</span>
                <ChevronRight size={20} className="text-[var(--text-secondary)]" />
              </Card>
              <Card className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--text-primary)]">Session Timeout</span>
                <span className="text-xs text-[var(--text-secondary)] font-mono-num">5 min</span>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-display font-bold text-[var(--text-secondary)] uppercase tracking-[0.18em] mb-3">Preferences</h3>
            <div className="space-y-2">
              <Card className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--text-primary)]">Default Currency</span>
                <span className="text-xs text-[var(--text-secondary)] font-mono-num">NGN</span>
              </Card>
              <Card className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--text-primary)]">Auto-Convert</span>
                <span className="text-[11px] font-display font-bold bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/30 px-2.5 py-1 rounded-full">ON</span>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-display font-bold text-[var(--text-secondary)] uppercase tracking-[0.18em] mb-3">Help</h3>
            <div className="space-y-2">
              <Card className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--text-primary)]">FAQ</span>
                <ChevronRight size={20} className="text-[var(--text-secondary)]" />
              </Card>
              <Card className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--text-primary)]">Support</span>
                <ChevronRight size={20} className="text-[var(--text-secondary)]" />
              </Card>
              <Card className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-[var(--text-primary)]">Privacy Policy</span>
                <ChevronRight size={20} className="text-[var(--text-secondary)]" />
              </Card>
            </div>
          </div>

          <Button variant="danger" size="lg" onClick={handleLogout} className="w-full">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
