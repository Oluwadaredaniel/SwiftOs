export interface UserProfile {
  id: string;
  telegramId: number;
  username: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
}

export interface WalletBalance {
  ngn: number;
  usd: number;
  usdt: number;
  usdt_address?: string;
  rates?: {
    usdt_ngn: number;
    usd_ngn: number;
  };
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'bill' | 'link' | 'convert' | 'save';
  amount: number;
  currency: 'NGN' | 'USD' | 'USDT';
  description: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  frequency: 'once' | 'weekly' | 'monthly' | 'biweekly';
  dueDate: Date;
  category: 'data' | 'airtime' | 'tv' | 'electricity';
  provider: string;
  status: 'active' | 'paused' | 'completed';
  billersCode?: string;
  variationCode?: string;
  serviceID?: string;
}

export interface SwiftyLink {
  id: string;
  amount: number;
  recipient?: string;
  note?: string;
  expiryDate: Date;
  status: 'active' | 'claimed' | 'expired';
  claimedBy?: string;
  claimedAt?: Date;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  createdAt: Date;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface AppState {
  user: TelegramUser | null;
  balances: WalletBalance;
  transactions: Transaction[];
  bills: Bill[];
  links: SwiftyLink[];
  goals: SavingsGoal[];
  loading: boolean;
  error: string | null;
}
