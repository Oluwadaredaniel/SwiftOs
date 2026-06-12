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
    // Telegram WebView reports the wrong value for 100vh — sync the real height.
    const syncHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    syncHeight();
    window.addEventListener('resize', syncHeight);

    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;

      if (webApp.initData) setIsTelegram(true);

      webApp.ready();
      webApp.expand();

      setTg(webApp);
      setIsReady(true);

      // Re-sync after Telegram expands the viewport
      webApp.onEvent('viewportChanged', syncHeight);

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

    return () => window.removeEventListener('resize', syncHeight);
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
