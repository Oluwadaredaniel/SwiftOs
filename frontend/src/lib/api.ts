import { WalletBalance, Transaction, Bill, SwiftyLink, SavingsGoal } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const TOKEN_KEY = 'swiftyos_token';

export const tokenStore = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set: (token: string) => {
    if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
  },
  clear: () => {
    if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
  },
};

const fetcher = async (endpoint: string, options: RequestInit = {}) => {
  const initData = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp?.initData : '';
  const token = tokenStore.get();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Telegram-Init-Data': initData || '',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const authAPI = {
  login: async () => {
    const res = await fetcher('/api/auth/telegram', { method: 'POST' });
    if (res.success && res.token) {
      tokenStore.set(res.token);
    }
    return res;
  },
};

export const walletAPI = {
  getBalance: async () => {
    const res = await fetcher('/api/wallet/balances');
    const d = res.data || res;
    return {
      status: 'success',
      data: {
        ngn: d.ngn ?? 0,
        usd: d.usd ?? 0,
        usdt: d.usdt ?? 0,
        usdt_address: d.usdt_address || '',
        rates: d.rates,
      } as WalletBalance,
    };
  },
  getRates: async () => {
    const res = await fetcher('/api/wallet/balances');
    const d = res.data || res;
    return {
      status: 'success',
      data: {
        NGN_USDT: d.rates?.usdt_ngn || 1450,
        NGN_USD: d.rates?.usd_ngn || 1400,
        USD_USDT: 1.0,
      },
    };
  },
  transfer: async (payload: { toUserId: string; amount: number; currency: string; description?: string }) => {
    return fetcher('/api/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  convert: async (payload: { from: string; to: string; amount: number }) => {
    return fetcher('/api/wallet/convert', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export const transactionsAPI = {
  list: async (filters?: { limit?: number }) => {
    const limit = filters?.limit || 20;
    const res = await fetcher(`/api/transactions/list?limit=${limit}`);
    return {
      status: 'success',
      data: (res.data || []) as Transaction[],
    };
  },
  getDetail: async (_txId: string) => {
    return { status: 'success', data: null };
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
      body: JSON.stringify(payload),
    });
  },
  getBills: async () => {
    const res = await fetcher('/api/autobills');
    const raw: any[] = res || [];
    return {
      status: 'success',
      data: raw.map((b): Bill => ({
        id: b._id,
        name: `${b.provider} ${b.type}`,
        amount: b.amount,
        frequency: b.frequency === 'daily' ? 'once' : b.frequency as Bill['frequency'],
        dueDate: new Date(b.nextDue),
        category: b.type?.toLowerCase() as Bill['category'],
        provider: b.provider,
        status: b.isActive ? 'active' : 'paused',
        billersCode: b.billersCode,
        variationCode: b.variationCode,
        serviceID: b.provider,
      })),
    };
  },
  createBill: async (data: any) => ({ status: 'success', data }),
};

export const linksAPI = {
  list: async () => {
    const res = await fetcher('/api/links/list');
    return { status: 'success', data: (res.data || []) as SwiftyLink[] };
  },
  create: async (data: { amount: number; currency?: string; note?: string }) => {
    const res = await fetcher('/api/links/', {
      method: 'POST',
      body: JSON.stringify({ currency: 'NGN', ...data }),
    });
    return { status: 'success', data: res.data };
  },
  claim: async (token: string) => {
    const res = await fetcher(`/api/links/${token}/claim`, { method: 'POST' });
    return { status: 'success', data: res.data };
  },
};

export const usersAPI = {
  lookup: async (username: string) => {
    const clean = username.replace(/^@/, '');
    const res = await fetcher(`/api/users/lookup?username=${encodeURIComponent(clean)}`);
    return { status: 'success', data: res.data as { id: string; username: string; firstName: string } };
  },
};

export const autobillsAPI = {
  list: async () => {
    const res = await fetcher('/api/autobills');
    return { status: 'success', data: (res || []) as any[] };
  },
  create: async (data: {
    type: string; provider: string; amount: number;
    currency: string; frequency: string; billersCode: string; variationCode?: string;
  }) => {
    const res = await fetcher('/api/autobills', { method: 'POST', body: JSON.stringify(data) });
    return { status: 'success', data: res };
  },
  delete: async (id: string) => {
    return fetcher(`/api/autobills/${id}`, { method: 'DELETE' });
  },
};

export const aiAPI = {
  ask: async (text: string) => {
    const res = await fetcher('/api/ai/ask', { method: 'POST', body: JSON.stringify({ text }) });
    return res as { action: string; [key: string]: any };
  },
};

export const savingsAPI = {
  list: async () => {
    const res = await fetcher('/api/savings/list');
    return { status: 'success', data: (res.data || []) as SavingsGoal[] };
  },
  create: async (data: { name: string; targetAmount: number; currency?: string; category?: string }) => {
    const res = await fetcher('/api/savings/', {
      method: 'POST',
      body: JSON.stringify({ currency: 'USDT', ...data }),
    });
    return { status: 'success', data: res.data };
  },
  deposit: async (goalId: string, amount: number) => {
    const res = await fetcher(`/api/savings/${goalId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    return { status: 'success', data: res.data };
  },
  withdraw: async (goalId: string, amount: number) => {
    const res = await fetcher(`/api/savings/${goalId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    return { status: 'success', data: res.data };
  },
};
