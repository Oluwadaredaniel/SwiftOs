import { WalletBalance, Transaction, Bill, SwiftyLink, SavingsGoal } from '@/types';

// Mocking API for frontend-only prototype
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const walletAPI = {
  getBalance: async () => {
    await delay(500);
    return {
      status: 'success',
      data: { ngn: 250500, usd: 120, usdt: 45.5, usdt_address: '0x71C765...d897' } as WalletBalance
    };
  },
  getTransactions: async (limit: number = 10) => {
    await delay(800);
    return {
      status: 'success',
      data: [
        { id: '1', type: 'bill', amount: 5000, currency: 'NGN', description: 'MTN Data Purchase', timestamp: new Date(), status: 'completed' },
        { id: '2', type: 'receive', amount: 25, currency: 'USDT', description: 'Received from @crypto_king', timestamp: new Date(Date.now() - 86400000), status: 'completed' },
      ] as Transaction[]
    };
  },
  getRates: async () => {
    await delay(300);
    return { status: 'success', data: { NGN_USDT: 1450, NGN_USD: 1400, USD_USDT: 1.02 } };
  },
  convert: async (from: string, to: string, amount: number) => {
    await delay(1500);
    return { status: 'success', message: 'Conversion successful' };
  },
};

export const billsAPI = {
  getProviders: async () => {
    await delay(500);
    return { status: 'success', data: [{ id: 'mtn', name: 'MTN' }, { id: 'airtel', name: 'Airtel' }] };
  },
  getVariations: async (providerId: string) => {
    await delay(500);
    return { status: 'success', data: [{ id: 'v1', name: '1GB Monthly', price: 1000 }] };
  },
  createBill: async (data: any) => {
    await delay(1000);
    return { status: 'success', data: { ...data, id: Math.random().toString() } };
  },
  getBills: async () => {
    await delay(600);
    return {
      status: 'success',
      data: [
        { id: 'b1', name: 'MTN Weekly Data', amount: 2500, frequency: 'weekly', dueDate: new Date(Date.now() + 86400000 * 3), category: 'data', provider: 'MTN', status: 'active' },
      ] as Bill[]
    };
  },
  payBill: async (billId: string) => {
    await delay(1000);
    return { status: 'success' };
  },
};

export const linksAPI = {
  create: async (data: any) => {
    await delay(1000);
    return { status: 'success', data: { id: 'link_' + Math.random(), ...data } };
  },
  list: async () => {
    await delay(700);
    return {
      status: 'success',
      data: [
        { id: 'l1', amount: 5000, expiryDate: new Date(Date.now() + 86400000), status: 'active', note: 'Lunch money' },
      ] as SwiftyLink[]
    };
  },
  claim: async (linkId: string) => {
    await delay(1200);
    return { status: 'success' };
  },
};

export const savingsAPI = {
  list: async () => {
    await delay(800);
    return {
      status: 'success',
      data: [
        { id: 'g1', title: 'New Laptop', targetAmount: 850, currentAmount: 425, category: 'Electronics', createdAt: new Date() },
      ] as SavingsGoal[]
    };
  },
  create: async (data: any) => {
    await delay(1000);
    return { status: 'success', data: { ...data, id: 'goal_' + Math.random() } };
  },
  deposit: async (goalId: string, amount: number) => {
    await delay(1000);
    return { status: 'success' };
  },
};

export const transactionsAPI = {
  list: async (filters?: any) => {
    await delay(1000);
    return {
      status: 'success',
      data: [
        { id: '1', type: 'bill', amount: 5000, currency: 'NGN', description: 'MTN Data Purchase', timestamp: new Date(), status: 'completed' },
        { id: '2', type: 'receive', amount: 25, currency: 'USDT', description: 'Received from @crypto_king', timestamp: new Date(Date.now() - 86400000), status: 'completed' },
        { id: '3', type: 'convert', amount: 15000, currency: 'NGN', description: 'Converted USDT to NGN', timestamp: new Date(Date.now() - 172800000), status: 'completed' },
      ] as Transaction[]
    };
  },
  getDetail: async (txId: string) => {
    await delay(500);
    return { status: 'success', data: { id: txId, amount: 5000, currency: 'NGN', description: 'MTN Data Purchase' } };
  },
};
