import { useEffect, useState } from 'react';

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  showPopup: (params: any) => void;
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
  };
  MainButton: {
    text: string;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
  };
  initData?: string;
  initDataUnsafe?: {
    user?: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
    auth_date?: number;
    hash?: string;
    chat_instance?: string;
    chat_type?: string;
  };
  colorScheme: 'light' | 'dark';
  backgroundColor: string;
  textColor: string;
  hintColor: string;
  linkColor: string;
  buttonColor: string;
  buttonTextColor: string;
  secondaryBgColor: string;
  headerBgColor: string;
  bottomBarBgColor: string;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  isVersionAtLeast: (version: string) => boolean;
  shareUrl: (url: string, callback?: (shared: boolean) => void) => void;
  onEvent: (eventType: string, callback: () => void) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const useTelegram = () => {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;

      // Basic check if we are actually inside Telegram
      if (webApp.initData) {
        setIsTelegram(true);
      }

      webApp.ready();
      webApp.expand();

      setTg(webApp);
      setIsReady(true);

      // Sync with Telegram's color scheme
      const root = document.documentElement;
      root.style.setProperty('--tg-color-scheme', webApp.colorScheme);
      root.style.setProperty('--tg-bg-color', webApp.backgroundColor);
      root.style.setProperty('--tg-text-color', webApp.textColor);
      root.style.setProperty('--tg-hint-color', webApp.hintColor);
      root.style.setProperty('--tg-link-color', webApp.linkColor);
      root.style.setProperty('--tg-button-color', webApp.buttonColor);
      root.style.setProperty('--tg-button-text-color', webApp.buttonTextColor);
      root.style.setProperty('--tg-secondary-bg-color', webApp.secondaryBgColor);
    } else {
      setIsReady(true);
    }
  }, []);

  const haptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(type);
    }
  };

  const share = (url: string, callback?: (shared: boolean) => void) => {
    if (tg?.shareUrl) {
      tg.shareUrl(url, callback);
    }
  };

  const close = () => {
    if (tg?.close) {
      tg.close();
    }
  };

  return {
    tg,
    isReady,
    isTelegram,
    user: tg?.initDataUnsafe?.user || null,
    initData: tg?.initData || null,
    haptic,
    share,
    close,
    colorScheme: tg?.colorScheme || 'light',
  };
};
