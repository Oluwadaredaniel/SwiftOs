import { WalletBalance, Transaction, Bill, SwiftyLink, SavingsGoal } from '@/types';

export const DEMO_BALANCE: WalletBalance = {
  ngn: 125500,
  usd: 45.00,
  usdt: 85.50,
  usdt_address: 'TQn7xHPKnfHgLqSX8mDvXa1K9bwkP8cTNz',
  rates: { usdt_ngn: 1580, usd_ngn: 1540 },
};

export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_001', type: 'receive', amount: 15000, currency: 'NGN',
    description: 'Transfer from @kenny_codes',
    timestamp: new Date(Date.now() - 2 * 3600_000), status: 'completed',
  },
  {
    id: 'tx_002', type: 'bill', amount: 1000, currency: 'NGN',
    description: 'MTN Data 1GB',
    timestamp: new Date(Date.now() - 5 * 3600_000), status: 'completed',
  },
  {
    id: 'tx_003', type: 'send', amount: 5000, currency: 'NGN',
    description: 'Sent to @tomi_k',
    timestamp: new Date(Date.now() - 24 * 3600_000), status: 'completed',
  },
  {
    id: 'tx_004', type: 'convert', amount: 10, currency: 'USDT',
    description: 'Converted 10 USDT → NGN',
    timestamp: new Date(Date.now() - 2 * 86400_000), status: 'completed',
  },
  {
    id: 'tx_005', type: 'bill', amount: 15700, currency: 'NGN',
    description: 'DStv Compact Renewal',
    timestamp: new Date(Date.now() - 3 * 86400_000), status: 'completed',
  },
  {
    id: 'tx_006', type: 'receive', amount: 8500, currency: 'NGN',
    description: 'Swifty Link claimed',
    timestamp: new Date(Date.now() - 4 * 86400_000), status: 'completed',
  },
  {
    id: 'tx_007', type: 'save', amount: 20, currency: 'USDT',
    description: 'Saved → MacBook Pro goal',
    timestamp: new Date(Date.now() - 5 * 86400_000), status: 'completed',
  },
  {
    id: 'tx_008', type: 'bill', amount: 2500, currency: 'NGN',
    description: 'MTN 5GB Data Bundle',
    timestamp: new Date(Date.now() - 6 * 86400_000), status: 'completed',
  },
  {
    id: 'tx_009', type: 'link', amount: 20000, currency: 'NGN',
    description: 'Swifty Link created',
    timestamp: new Date(Date.now() - 8 * 86400_000), status: 'completed',
  },
  {
    id: 'tx_010', type: 'receive', amount: 50000, currency: 'NGN',
    description: 'Funded wallet (test)',
    timestamp: new Date(Date.now() - 10 * 86400_000), status: 'completed',
  },
];

export const DEMO_BILLS: Bill[] = [
  {
    id: 'bill_001', name: 'DStv Compact', amount: 15700, frequency: 'monthly',
    dueDate: new Date(Date.now() + 12 * 86400_000), category: 'tv',
    provider: 'dstv', status: 'active', billersCode: '7042211593',
    variationCode: 'dstv-compact', serviceID: 'dstv',
  },
  {
    id: 'bill_002', name: 'MTN 5GB Data', amount: 2500, frequency: 'monthly',
    dueDate: new Date(Date.now() + 7 * 86400_000), category: 'data',
    provider: 'mtn-data', status: 'active', billersCode: '08012345678',
    variationCode: 'mtn-5gb-2500', serviceID: 'mtn-data',
  },
];

export const DEMO_GOALS: SavingsGoal[] = [
  {
    id: 'goal_001', title: 'New MacBook Pro', targetAmount: 1500,
    currentAmount: 675, category: 'Electronics',
    createdAt: new Date(Date.now() - 30 * 86400_000),
  },
  {
    id: 'goal_002', title: 'Emergency Fund', targetAmount: 500,
    currentAmount: 390, category: 'Security',
    createdAt: new Date(Date.now() - 60 * 86400_000),
  },
];

export const DEMO_LINKS: SwiftyLink[] = [
  {
    id: 'link_001', amount: 15000, note: 'Rent contribution',
    expiryDate: new Date(Date.now() + 7 * 86400_000), status: 'active',
  },
];
