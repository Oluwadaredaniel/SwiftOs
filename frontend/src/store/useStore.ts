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
    ngn: 0,
    usd: 0,
    usdt: 0,
    usdt_address: '',
  },
  transactions: [],
  bills: [],
  links: [],
  goals: [],
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
