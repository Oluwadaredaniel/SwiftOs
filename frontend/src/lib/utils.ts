export const formatCurrency = (amount: number, currency: 'NGN' | 'USD' | 'USDT' = 'NGN') => {
  const symbols = { NGN: '₦', USD: '$', USDT: 'USDT' };
  const decimals = currency === 'NGN' ? 0 : 2;
  const symbol = symbols[currency];

  return `${symbol}${amount.toLocaleString('en-NG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

export const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday =
    d.toDateString() === today.toDateString();
  const isYesterday =
    d.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  return d.toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const truncateAddress = (address: string, chars = 4) => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const copyToClipboard = (text: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  return Promise.resolve();
};

export const getTransactionIcon = (type: string) => {
  const icons: Record<string, string> = {
    send: '📤',
    receive: '📥',
    bill: '📱',
    link: '🔗',
    convert: '🔄',
    save: '💰',
  };
  return icons[type] || '📊';
};
