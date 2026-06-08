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
    <div className="flex flex-col h-full bg-[var(--tg-bg-color)]">
      <div className="bg-[var(--tg-secondary-bg-color)] border-b border-[var(--tg-hint-color)]/10 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
        <Button size="sm" variant="secondary" onClick={onBackClick}>
          ← Back
        </Button>
        <h2 className="text-lg font-bold text-[var(--tg-text-color)]">Settings</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-[var(--tg-hint-color)] uppercase mb-3">Profile</h3>
            <Card className="space-y-3">
              <div>
                <div className="text-xs text-[var(--tg-hint-color)]">Username</div>
                <div className="text-sm font-semibold text-[var(--tg-text-color)]">@{user?.username || 'anonymous'}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--tg-hint-color)]">Telegram ID</div>
                <div className="text-sm font-semibold text-[var(--tg-text-color)] font-mono">{user?.id}</div>
              </div>
              <div>
                <div className="text-xs text-[var(--tg-hint-color)]">Name</div>
                <div className="text-sm font-semibold text-[var(--tg-text-color)]">
                  {user?.first_name} {user?.last_name || ''}
                </div>
              </div>
            </Card>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[var(--tg-hint-color)] uppercase mb-3">Security</h3>
            <div className="space-y-2">
              <Card className="flex items-center justify-between cursor-pointer hover:opacity-80">
                <span className="text-sm text-[var(--tg-text-color)]">Two-Factor Auth</span>
                <ChevronRight size={20} className="text-[var(--tg-hint-color)]" />
              </Card>
              <Card className="flex items-center justify-between cursor-pointer hover:opacity-80">
                <span className="text-sm text-[var(--tg-text-color)]">Session Timeout</span>
                <span className="text-xs text-[var(--tg-hint-color)]">5 min</span>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[var(--tg-hint-color)] uppercase mb-3">Preferences</h3>
            <div className="space-y-2">
              <Card className="flex items-center justify-between cursor-pointer hover:opacity-80">
                <span className="text-sm text-[var(--tg-text-color)]">Default Currency</span>
                <span className="text-xs text-[var(--tg-hint-color)]">NGN</span>
              </Card>
              <Card className="flex items-center justify-between cursor-pointer hover:opacity-80">
                <span className="text-sm text-[var(--tg-text-color)]">Auto-Convert</span>
                <span className="text-xs bg-[var(--success)] text-white px-2 py-1 rounded">ON</span>
              </Card>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[var(--tg-hint-color)] uppercase mb-3">Help</h3>
            <div className="space-y-2">
              <Card className="flex items-center justify-between cursor-pointer hover:opacity-80">
                <span className="text-sm text-[var(--tg-text-color)]">FAQ</span>
                <ChevronRight size={20} className="text-[var(--tg-hint-color)]" />
              </Card>
              <Card className="flex items-center justify-between cursor-pointer hover:opacity-80">
                <span className="text-sm text-[var(--tg-text-color)]">Support</span>
                <ChevronRight size={20} className="text-[var(--tg-hint-color)]" />
              </Card>
              <Card className="flex items-center justify-between cursor-pointer hover:opacity-80">
                <span className="text-sm text-[var(--tg-text-color)]">Privacy Policy</span>
                <ChevronRight size={20} className="text-[var(--tg-hint-color)]" />
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
