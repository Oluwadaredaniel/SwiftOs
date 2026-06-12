'use client';

import { Settings } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';

interface HeaderProps {
  onSettingsClick?: () => void;
  showSettings?: boolean;
}

export const Header = ({ onSettingsClick, showSettings = true }: HeaderProps) => {
  const { user } = useTelegram();

  return (
    <div className="flex-shrink-0 px-4 pt-4 pb-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {user?.photo_url ? (
          <img
            src={user.photo_url}
            alt={user.first_name}
            className="w-9 h-9 rounded-full border border-[var(--border-strong)] object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[var(--surface-2)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--accent)] font-semibold text-sm flex-shrink-0">
            {(user?.first_name || 'S').charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-[11px] text-[var(--text-muted)] font-medium leading-none mb-0.5">SwiftyOS</p>
          <p className="text-[15px] font-semibold text-[var(--text-primary)] leading-none">
            {user?.first_name || 'Dashboard'}
          </p>
        </div>
      </div>

      {showSettings && (
        <button
          onClick={onSettingsClick}
          className="w-9 h-9 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0"
        >
          <Settings size={17} />
        </button>
      )}
    </div>
  );
};
