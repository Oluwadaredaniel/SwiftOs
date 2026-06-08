import { create } from 'zustand';
import { AppState, Transaction, WalletBalance, Bill, SwiftyLink, SavingsGoal, TelegramUser } from '@/types';

interface Store extends AppState {
  setUser: (user: TelegramUser | null) => void;
  setBalances: (balances: WalletBalance) => void;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  setBills: (bills: Bill[]) => void;
  setLinks: (links: SwiftyLink[]) => void;
  setGoals: (goals: SavingsGoal[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: AppState = {
  user: null,
  balances: {
    ngn: 250500,
    usd: 120,
    usdt: 45.5,
    usdt_address: '0x71C765...d897',
  },
  transactions: [
    {
      id: '1',
      type: 'bill',
      amount: 5000,
      currency: 'NGN',
      description: 'MTN Data Purchase',
      timestamp: new Date(),
      status: 'completed',
    },
    {
      id: '2',
      type: 'receive',
      amount: 25,
      currency: 'USDT',
      description: 'Received from @crypto_king',
      timestamp: new Date(Date.now() - 86400000),
      status: 'completed',
    },
    {
      id: '3',
      type: 'convert',
      amount: 15000,
      currency: 'NGN',
      description: 'Converted USDT to NGN',
      timestamp: new Date(Date.now() - 172800000),
      status: 'completed',
    },
  ],
  bills: [
    {
      id: 'b1',
      name: 'MTN Weekly Data',
      amount: 2500,
      frequency: 'weekly',
      dueDate: new Date(Date.now() + 86400000 * 3),
      category: 'data',
      provider: 'MTN',
      status: 'active',
    },
    {
      id: 'b2',
      name: 'DSTV Compact',
      amount: 12000,
      frequency: 'monthly',
      dueDate: new Date(Date.now() + 86400000 * 10),
      category: 'tv',
      provider: 'DSTV',
      status: 'active',
    },
  ],
  links: [
    {
      id: 'l1',
      amount: 5000,
      expiryDate: new Date(Date.now() + 86400000),
      status: 'active',
      note: 'Lunch money',
    },
  ],
  goals: [
    {
      id: 'g1',
      title: 'New Laptop',
      targetAmount: 850,
      currentAmount: 425,
      category: 'Electronics',
      createdAt: new Date(),
    },
    {
      id: 'g2',
      title: 'Emergency Fund',
      targetAmount: 2000,
      currentAmount: 150,
      category: 'Security',
      createdAt: new Date(),
    },
  ],
  loading: false,
  error: null,
};

export const useStore = create<Store>((set) => ({
  ...initialState,

  setUser: (user) => set({ user }),
  setBalances: (balances) => set({ balances }),
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => set((state) => ({
    transactions: [transaction, ...state.transactions],
  })),
  setBills: (bills) => set({ bills }),
  setLinks: (links) => set({ links }),
  setGoals: (goals) => set({ goals }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
