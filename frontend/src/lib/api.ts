import { WalletBalance, Transaction, Bill, SwiftyLink, SavingsGoal } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Base fetcher that automatically includes Telegram Init Data for authentication.
 */
const fetcher = async (endpoint: string, options: RequestInit = {}) => {
  const initData = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp?.initData : '';

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData || '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const authAPI = {
  login: async () => {
    return fetcher('/auth/telegram', { method: 'POST' });
  }
};

export const walletAPI = {
  getBalance: async () => {
    const data = await fetcher('/api/wallet/balances');
    return {
      status: 'success',
      data: {
        ngn: data.ngn_balance,
        usd: data.usd_balance,
        usdt: data.usdt_balance,
        usdt_address: data.usdt_address || 'Address pending...',
        ngn_equivalent: data.ngn_equivalent
      } as WalletBalance
    };
  },
  getTransactions: async (limit: number = 10) => {
    // Note: Backend endpoint for transactions still needs implementation in feature phase
    return {
      status: 'success',
      data: [] as Transaction[]
    };
  },
  getRates: async () => {
    const data = await fetcher('/api/wallet/balances');
    return {
      status: 'success',
      data: {
        NGN_USDT: data.rates?.usdt_ngn || 1348,
        NGN_USD: 1400, // Still mock until USD logic is added
        USD_USDT: 1.02
      }
    };
  },
};

export const billsAPI = {
  getProviders: async (category: string = 'data') => {
    const data = await fetcher(`/api/bills/providers?category=${category}`);
    return { status: 'success', data: data.content || [] };
  },
  getVariations: async (serviceID: string) => {
    const data = await fetcher(`/api/bills/variations?serviceID=${serviceID}`);
    return { status: 'success', data: data.content?.varations || [] };
  },
  payBill: async (payload: {
    serviceID: string;
    amount: number;
    phone: string;
    variation_code?: string;
  }) => {
    return fetcher('/api/bills/pay', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  // Placeholders for future features
  createBill: async (data: any) => ({ status: 'success', data }),
  getBills: async () => ({ status: 'success', data: [] as Bill[] }),
};

export const linksAPI = {
  create: async (data: any) => ({ status: 'success', data }),
  list: async () => ({ status: 'success', data: [] as SwiftyLink[] }),
  claim: async (linkId: string) => ({ status: 'success' }),
};

export const savingsAPI = {
  list: async () => ({ status: 'success', data: [] as SavingsGoal[] }),
  create: async (data: any) => ({ status: 'success', data }),
  deposit: async (goalId: string, amount: number) => ({ status: 'success' }),
};

export const transactionsAPI = {
  list: async (filters?: any) => {
    // Note: Backend endpoint for transactions still needs implementation in feature phase
    return {
      status: 'success',
      data: [] as Transaction[]
    };
  },
  getDetail: async (txId: string) => {
    return { status: 'success', data: { id: txId, amount: 5000, currency: 'NGN', description: 'MTN Data Purchase' } };
  },
};
