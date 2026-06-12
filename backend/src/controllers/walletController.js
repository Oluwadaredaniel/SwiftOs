import walletService from '../services/walletService.js';
import rateService from '../services/rateService.js';
import swiftyexService from '../services/swiftyexService.js';
import Transaction from '../models/Transaction.js';

export const getBalances = async (req, res) => {
  try {
    const rate = await rateService.getUsdtNgnRate();

    // Try to get real balances + deposit address from SwiftyEx
    let swiftyWallets = null;
    if (req.user.initData) {
      try {
        swiftyWallets = await swiftyexService.getWallets(req.user.initData);
      } catch (e) {
        console.error('SwiftyEx wallets fetch failed, falling back to internal:', e.message);
      }
    }

    // Fall back to our internal ledger if SwiftyEx is unavailable
    const internalWallet = await walletService.getWallet(req.user._id);

    let usdt = internalWallet.balances.USDT;
    let ngn = internalWallet.balances.NGN;
    let usdtAddress = null;

    if (swiftyWallets) {
      const usdtWallet = swiftyWallets.find?.(w => w.wallet_type?.toLowerCase() === 'usdt');
      const ngnWallet = swiftyWallets.find?.(w => w.wallet_type?.toLowerCase() === 'naira');
      if (usdtWallet) { usdt = usdtWallet.balance; usdtAddress = usdtWallet.deposit_address; }
      if (ngnWallet) ngn = ngnWallet.balance;
    }

    res.json({
      status: 'success',
      data: {
        ngn,
        usdt,
        usd: 0,
        usdt_address: usdtAddress,
        rates: { usdt_ngn: rate, usd_ngn: rate },
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const transfer = async (req, res) => {
  try {
    const { toUserId, amount, currency, description } = req.body;

    if (!toUserId) return res.status(400).json({ status: 'error', message: 'toUserId is required' });
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ status: 'error', message: 'amount must be a positive number' });
    }
    if (!['NGN', 'USDT'].includes(currency)) {
      return res.status(400).json({ status: 'error', message: 'currency must be NGN or USDT' });
    }
    if (toUserId === String(req.user._id)) {
      return res.status(400).json({ status: 'error', message: 'Cannot transfer to yourself' });
    }

    const result = await walletService.transfer(req.user._id, toUserId, Number(amount), currency, description);
    res.json({ status: 'success', data: result });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const fundWallet = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ status: 'error', message: 'amount must be a positive number' });
    }
    if (!['NGN', 'USDT', 'USD'].includes(currency)) {
      return res.status(400).json({ status: 'error', message: 'currency must be NGN, USDT, or USD' });
    }
    const wallet = await walletService.fundWallet(req.user._id, Number(amount), currency);
    res.json({ status: 'success', data: wallet });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const convertCurrency = async (req, res) => {
  try {
    const { from, to, amount } = req.body;
    const VALID = ['NGN', 'USDT'];
    if (!VALID.includes(from) || !VALID.includes(to)) {
      return res.status(400).json({ status: 'error', message: 'from/to must be NGN or USDT' });
    }
    if (from === to) {
      return res.status(400).json({ status: 'error', message: 'from and to currencies must differ' });
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ status: 'error', message: 'amount must be a positive number' });
    }
    const result = await walletService.convertCurrency(req.user._id, from, to, Number(amount));
    res.json({ status: 'success', data: result });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const raw = await walletService.getHistory(req.user._id, limit);

    const data = raw.map(tx => ({
      id: tx._id,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      description: tx.description,
      timestamp: tx.createdAt,
      status: tx.status,
    }));

    res.json({ status: 'success', data });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
