import { WalletBalance, Transaction, Bill, SwiftyLink, SavingsGoal } from '@/types';
import {
  DEMO_BALANCE, DEMO_TRANSACTIONS, DEMO_BILLS, DEMO_GOALS, DEMO_LINKS,
} from './demoData';

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
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: async () => {
    try {
      const res = await fetcher('/api/auth/telegram', { method: 'POST' });
      if (res.success && res.token) tokenStore.set(res.token);
      return res;
    } catch {
      return { success: true, demo: true, user: null };
    }
  },
};

// ─── Wallet ───────────────────────────────────────────────────────────────────

export const walletAPI = {
  getBalance: async () => {
    try {
      const res = await fetcher('/api/wallet/balances');
      const d = res.data || res;
      if (d.ngn !== undefined) {
        return {
          status: 'success',
          data: {
            ngn: d.ngn ?? 0, usd: d.usd ?? 0, usdt: d.usdt ?? 0,
            usdt_address: d.usdt_address || '',
            rates: d.rates,
          } as WalletBalance,
        };
      }
    } catch {}
    return { status: 'success', data: DEMO_BALANCE };
  },

  getRates: async () => {
    try {
      const res = await fetcher('/api/wallet/balances');
      const d = res.data || res;
      return { status: 'success', data: { NGN_USDT: d.rates?.usdt_ngn || 1580, NGN_USD: d.rates?.usd_ngn || 1540, USD_USDT: 1.0 } };
    } catch {}
    return { status: 'success', data: { NGN_USDT: 1580, NGN_USD: 1540, USD_USDT: 1.0 } };
  },

  transfer: async (payload: { toUserId: string; amount: number; currency: string; description?: string }) => {
    try {
      return await fetcher('/api/wallet/transfer', { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      return { success: true, demo: true, message: 'Transfer simulated (demo mode)' };
    }
  },

  convert: async (payload: { from: string; to: string; amount: number }) => {
    try {
      return await fetcher('/api/wallet/convert', { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      return { success: true, demo: true, message: 'Conversion simulated (demo mode)' };
    }
  },
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactionsAPI = {
  list: async (filters?: { limit?: number }) => {
    try {
      const limit = filters?.limit || 20;
      const res = await fetcher(`/api/transactions/list?limit=${limit}`);
      const data = (res.data || []) as Transaction[];
      if (data.length > 0) return { status: 'success', data };
    } catch {}
    return { status: 'success', data: DEMO_TRANSACTIONS };
  },
  getDetail: async (_txId: string) => ({ status: 'success', data: null }),
};

// ─── Bills ────────────────────────────────────────────────────────────────────

const MOCK_PROVIDERS: Record<string, any[]> = {
  airtime: [
    { serviceID: 'mtn',     name: 'MTN Nigeria',   image: 'https://vtpass.com/resources/image/2019/08/mtn-1.jpg' },
    { serviceID: 'airtel',  name: 'Airtel Nigeria', image: 'https://vtpass.com/resources/image/2019/08/airtel.jpg' },
    { serviceID: 'glo',     name: 'Glo Mobile',    image: 'https://vtpass.com/resources/image/2019/08/glo.jpg' },
    { serviceID: '9mobile', name: '9mobile',        image: 'https://vtpass.com/resources/image/2019/10/9mobile.jpg' },
  ],
  data: [
    { serviceID: 'mtn-data',     name: 'MTN Data',     image: 'https://vtpass.com/resources/image/2019/08/mtn-1.jpg' },
    { serviceID: 'airtel-data',  name: 'Airtel Data',  image: 'https://vtpass.com/resources/image/2019/08/airtel.jpg' },
    { serviceID: 'glo-data',     name: 'Glo Data',     image: 'https://vtpass.com/resources/image/2019/08/glo.jpg' },
    { serviceID: '9mobile-data', name: '9mobile Data', image: 'https://vtpass.com/resources/image/2019/10/9mobile.jpg' },
  ],
  tv: [
    { serviceID: 'dstv',      name: 'DStv',      image: 'https://vtpass.com/resources/image/2019/08/dstv.jpg' },
    { serviceID: 'gotv',      name: 'GOtv',      image: 'https://vtpass.com/resources/image/2019/08/gotv.jpg' },
    { serviceID: 'startimes', name: 'Startimes', image: 'https://vtpass.com/resources/image/2020/12/startimes.jpg' },
  ],
  electricity: [
    { serviceID: 'ikeja-electric',  name: 'Ikeja Electric (IKEDC)',  image: 'https://vtpass.com/resources/image/2019/08/ikedc.jpg' },
    { serviceID: 'eko-electric',    name: 'Eko Electric (EKEDC)',    image: 'https://vtpass.com/resources/image/2019/08/ekedc.jpg' },
    { serviceID: 'abuja-electric',  name: 'Abuja Electric (AEDC)',   image: 'https://vtpass.com/resources/image/2019/08/aedc.jpg' },
    { serviceID: 'ibadan-electric', name: 'Ibadan Electric (IBEDC)', image: 'https://vtpass.com/resources/image/2020/09/ibedc.png' },
    { serviceID: 'kano-electric',   name: 'Kano Electric (KEDCO)',   image: 'https://vtpass.com/resources/image/2022/01/kano.jpg' },
  ],
};

const MOCK_VARIATIONS: Record<string, any[]> = {
  'mtn-data': [
    { variation_code: 'mtn-50mb',  name: 'MTN 50MB — 1 day',    variation_amount: '100' },
    { variation_code: 'mtn-500mb', name: 'MTN 500MB — 7 days',  variation_amount: '300' },
    { variation_code: 'mtn-1gb',   name: 'MTN 1GB — 30 days',   variation_amount: '1000' },
    { variation_code: 'mtn-2gb',   name: 'MTN 2GB — 30 days',   variation_amount: '1500' },
    { variation_code: 'mtn-5gb',   name: 'MTN 5GB — 30 days',   variation_amount: '2500' },
    { variation_code: 'mtn-10gb',  name: 'MTN 10GB — 30 days',  variation_amount: '4000' },
  ],
  'airtel-data': [
    { variation_code: 'airtel-500mb', name: 'Airtel 500MB',  variation_amount: '300' },
    { variation_code: 'airtel-1gb',   name: 'Airtel 1GB',    variation_amount: '1000' },
    { variation_code: 'airtel-3gb',   name: 'Airtel 3GB',    variation_amount: '1500' },
    { variation_code: 'airtel-6gb',   name: 'Airtel 6GB',    variation_amount: '2500' },
    { variation_code: 'airtel-10gb',  name: 'Airtel 10GB',   variation_amount: '3500' },
  ],
  'glo-data': [
    { variation_code: 'glo-1gb',  name: 'Glo 1GB',    variation_amount: '500' },
    { variation_code: 'glo-2gb',  name: 'Glo 2.9GB',  variation_amount: '1000' },
    { variation_code: 'glo-5gb',  name: 'Glo 5.8GB',  variation_amount: '2000' },
    { variation_code: 'glo-10gb', name: 'Glo 11.5GB', variation_amount: '3000' },
  ],
  '9mobile-data': [
    { variation_code: '9m-1gb',   name: '9mobile 1GB',   variation_amount: '1000' },
    { variation_code: '9m-2.5gb', name: '9mobile 2.5GB', variation_amount: '1500' },
    { variation_code: '9m-5gb',   name: '9mobile 5GB',   variation_amount: '2000' },
  ],
  dstv: [
    { variation_code: 'dstv-padi',         name: 'DStv Padi',         variation_amount: '2150' },
    { variation_code: 'dstv-yanga',        name: 'DStv Yanga',        variation_amount: '2950' },
    { variation_code: 'dstv-confam',       name: 'DStv Confam',       variation_amount: '6200' },
    { variation_code: 'dstv-compact',      name: 'DStv Compact',      variation_amount: '15700' },
    { variation_code: 'dstv-compact-plus', name: 'DStv Compact Plus', variation_amount: '24700' },
    { variation_code: 'dstv-premium',      name: 'DStv Premium',      variation_amount: '37000' },
  ],
  gotv: [
    { variation_code: 'gotv-smallie', name: 'GOtv Smallie', variation_amount: '1575' },
    { variation_code: 'gotv-jinja',   name: 'GOtv Jinja',   variation_amount: '3000' },
    { variation_code: 'gotv-jolli',   name: 'GOtv Jolli',   variation_amount: '4850' },
    { variation_code: 'gotv-max',     name: 'GOtv Max',     variation_amount: '7200' },
  ],
  startimes: [
    { variation_code: 'st-nova',    name: 'Startimes Nova',    variation_amount: '1900' },
    { variation_code: 'st-basic',   name: 'Startimes Basic',   variation_amount: '2600' },
    { variation_code: 'st-smart',   name: 'Startimes Smart',   variation_amount: '4900' },
    { variation_code: 'st-classic', name: 'Startimes Classic', variation_amount: '5800' },
  ],
  mtn: [], airtel: [], glo: [], '9mobile': [],
  'ikeja-electric': [], 'eko-electric': [], 'abuja-electric': [], 'ibadan-electric': [], 'kano-electric': [],
};

export const billsAPI = {
  getProviders: async (category: string = 'data') => {
    try {
      const data = await fetcher(`/api/bills/providers?category=${category}`);
      const list = data.data || [];
      if (list.length > 0) return { status: 'success', data: list };
    } catch {}
    return { status: 'success', data: MOCK_PROVIDERS[category] || [] };
  },

  getVariations: async (serviceID: string) => {
    try {
      const data = await fetcher(`/api/bills/variations?serviceID=${serviceID}`);
      const list = data.data?.varations || data.data?.variations || [];
      if (list.length > 0) return { status: 'success', data: list };
    } catch {}
    return { status: 'success', data: MOCK_VARIATIONS[serviceID] || [] };
  },

  payBill: async (payload: { serviceID: string; amount: number; phone: string; variation_code?: string }) => {
    try {
      return await fetcher('/api/bills/pay', { method: 'POST', body: JSON.stringify(payload) });
    } catch {
      await new Promise((r) => setTimeout(r, 1200));
      return {
        success: true, demo: true,
        token: `SWF${Date.now().toString().slice(-8)}`,
        message: 'Payment processed (demo mode)',
      };
    }
  },

  getBills: async () => {
    try {
      const res = await fetcher('/api/autobills');
      const raw: any[] = res || [];
      if (raw.length > 0) {
        return {
          status: 'success',
          data: raw.map((b): Bill => ({
            id: b._id, name: `${b.provider} ${b.type}`, amount: b.amount,
            frequency: b.frequency === 'daily' ? 'once' : b.frequency as Bill['frequency'],
            dueDate: new Date(b.nextDue),
            category: b.type?.toLowerCase() as Bill['category'],
            provider: b.provider, status: b.isActive ? 'active' : 'paused',
            billersCode: b.billersCode, variationCode: b.variationCode, serviceID: b.provider,
          })),
        };
      }
    } catch {}
    return { status: 'success', data: DEMO_BILLS };
  },

  createBill: async (data: any) => ({ status: 'success', data }),
};

// ─── Links ────────────────────────────────────────────────────────────────────

export const linksAPI = {
  list: async () => {
    try {
      const res = await fetcher('/api/links/list');
      const data = (res.data || []) as SwiftyLink[];
      if (data.length > 0) return { status: 'success', data };
    } catch {}
    return { status: 'success', data: DEMO_LINKS };
  },

  create: async (data: { amount: number; currency?: string; note?: string }) => {
    try {
      const res = await fetcher('/api/links/', { method: 'POST', body: JSON.stringify({ currency: 'NGN', ...data }) });
      return { status: 'success', data: res.data };
    } catch {
      return {
        status: 'success',
        data: {
          id: `demo_${Date.now()}`,
          token: `demo_${Date.now()}`,
          amount: data.amount,
          note: data.note,
          status: 'active',
          expiryDate: new Date(Date.now() + 7 * 86400_000),
        },
      };
    }
  },

  claim: async (token: string) => {
    try {
      const res = await fetcher(`/api/links/${token}/claim`, { method: 'POST' });
      return { status: 'success', data: res.data };
    } catch {
      return { status: 'success', data: { demo: true, message: 'Link claimed (demo mode)' } };
    }
  },
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersAPI = {
  lookup: async (username: string) => {
    const clean = username.replace(/^@/, '');
    try {
      const res = await fetcher(`/api/users/lookup?username=${encodeURIComponent(clean)}`);
      return { status: 'success', data: res.data as { id: string; username: string; firstName: string } };
    } catch {
      return { status: 'success', data: { id: `demo_${clean}`, username: clean, firstName: clean } };
    }
  },
};

// ─── Auto-bills ───────────────────────────────────────────────────────────────

export const autobillsAPI = {
  list: async () => {
    try {
      const res = await fetcher('/api/autobills');
      return { status: 'success', data: (res || []) as any[] };
    } catch {
      return { status: 'success', data: [] };
    }
  },
  create: async (data: { type: string; provider: string; amount: number; currency: string; frequency: string; billersCode: string; variationCode?: string }) => {
    try {
      const res = await fetcher('/api/autobills', { method: 'POST', body: JSON.stringify(data) });
      return { status: 'success', data: res };
    } catch {
      return { status: 'success', data: { ...data, _id: `demo_${Date.now()}`, isActive: true } };
    }
  },
  delete: async (id: string) => {
    try {
      return await fetcher(`/api/autobills/${id}`, { method: 'DELETE' });
    } catch {
      return { success: true };
    }
  },
};

// ─── Savings ──────────────────────────────────────────────────────────────────

export const savingsAPI = {
  list: async () => {
    try {
      const res = await fetcher('/api/savings/list');
      const data = (res.data || []) as SavingsGoal[];
      if (data.length > 0) return { status: 'success', data };
    } catch {}
    return { status: 'success', data: DEMO_GOALS };
  },

  create: async (data: { name: string; targetAmount: number; currency?: string; category?: string }) => {
    try {
      const res = await fetcher('/api/savings/', { method: 'POST', body: JSON.stringify({ currency: 'USDT', ...data }) });
      return { status: 'success', data: res.data };
    } catch {
      return {
        status: 'success',
        data: {
          id: `demo_${Date.now()}`, title: data.name,
          targetAmount: data.targetAmount, currentAmount: 0,
          category: data.category || 'General',
          createdAt: new Date(),
        } as SavingsGoal,
      };
    }
  },

  deposit: async (goalId: string, amount: number) => {
    try {
      const res = await fetcher(`/api/savings/${goalId}/deposit`, { method: 'POST', body: JSON.stringify({ amount }) });
      return { status: 'success', data: res.data };
    } catch {
      return { status: 'success', data: { demo: true, goalId, amount } };
    }
  },

  withdraw: async (goalId: string, amount: number) => {
    try {
      const res = await fetcher(`/api/savings/${goalId}/withdraw`, { method: 'POST', body: JSON.stringify({ amount }) });
      return { status: 'success', data: res.data };
    } catch {
      return { status: 'success', data: { demo: true } };
    }
  },
};

// ─── Dev ──────────────────────────────────────────────────────────────────────

export const devAPI = {
  fund: async (amount: number, currency: 'NGN' | 'USDT' | 'USD') => {
    try {
      return await fetcher('/api/dev/fund', { method: 'POST', body: JSON.stringify({ amount, currency }) });
    } catch {
      return { success: true, demo: true, amount, currency };
    }
  },
};
