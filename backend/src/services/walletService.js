import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';

class WalletService {
  async getWallet(userId) {
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balances: { USDT: 0, NGN: 0 } });
    }
    return wallet;
  }

  async fundWallet(userId, amount, currency = 'USDT') {
    const wallet = await this.getWallet(userId);
    wallet.balances[currency] += amount;
    await wallet.save();

    await Transaction.create({
      userId,
      type: 'fund',
      amount,
      currency,
      description: `Funded ${amount} ${currency}`,
    });

    return wallet;
  }

  async transfer(fromUserId, toUserId, amount, currency, description) {
    const fromWallet = await this.getWallet(fromUserId);
    
    if (fromWallet.balances[currency] < amount) {
      throw new Error('Insufficient balance');
    }

    fromWallet.balances[currency] -= amount;
    await fromWallet.save();

    if (toUserId !== 'SYSTEM') {
      const toWallet = await this.getWallet(toUserId);
      toWallet.balances[currency] += amount;
      await toWallet.save();
    }

    await Transaction.create({
      userId: fromUserId,
      type: toUserId === 'SYSTEM' ? 'autobill' : 'transfer',
      amount,
      currency,
      description: description || (toUserId === 'SYSTEM' ? 'System Payment' : `Sent to ${toUserId}`),
    });

    if (toUserId !== 'SYSTEM') {
      await Transaction.create({
        userId: toUserId,
        type: 'receive',
        amount,
        currency,
        description: description || `Received from ${fromUserId}`,
      });
    }

    return { fromWallet };
  }

  async getHistory(userId) {
    return Transaction.find({ userId }).sort({ createdAt: -1 });
  }
}

export default new WalletService();
