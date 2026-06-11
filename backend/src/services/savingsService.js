import SavingsGoal from '../models/SavingsGoal.js';
import walletService from './walletService.js';
import Transaction from '../models/Transaction.js';

class SavingsService {
  async getAll(userId) {
    return SavingsGoal.find({ userId }).sort({ createdAt: -1 });
  }

  async create(userId, { name, targetAmount, currency = 'NGN', category, deadline }) {
    return SavingsGoal.create({ userId, name, targetAmount, currency, category, deadline });
  }

  // Deposit deducts NGN from the user's NGN wallet and locks it.
  // The NGN amount stored never changes — no exchange rate exposure.
  // You save ₦1,500 today, you withdraw exactly ₦1,500 in 30 days.
  async deposit(userId, goalId, amount) {
    const goal = await SavingsGoal.findOne({ _id: goalId, userId });
    if (!goal) throw new Error('Savings goal not found');
    if (goal.isCompleted) throw new Error('Goal already completed');

    const wallet = await walletService.getWallet(userId);
    if (wallet.balances.NGN < amount) throw new Error('Insufficient NGN balance');

    wallet.balances.NGN -= amount;
    await wallet.save();

    await Transaction.create({
      userId,
      type: 'fund',
      amount,
      currency: 'NGN',
      description: `Deposited to savings: "${goal.name}"`,
    });

    goal.currentAmount += amount;
    if (goal.currentAmount >= goal.targetAmount) goal.isCompleted = true;
    await goal.save();

    return goal;
  }

  // Withdrawal returns the exact NGN stored — no rate conversion.
  async withdraw(userId, goalId, amount) {
    const goal = await SavingsGoal.findOne({ _id: goalId, userId });
    if (!goal) throw new Error('Savings goal not found');
    if (goal.currentAmount < amount) throw new Error('Insufficient savings balance');

    const wallet = await walletService.getWallet(userId);
    wallet.balances.NGN += amount;
    await wallet.save();

    await Transaction.create({
      userId,
      type: 'fund',
      amount,
      currency: 'NGN',
      description: `Withdrawn from savings: "${goal.name}"`,
    });

    goal.currentAmount -= amount;
    goal.isCompleted = false;
    await goal.save();

    return goal;
  }

  async delete(userId, goalId) {
    const goal = await SavingsGoal.findOneAndDelete({ _id: goalId, userId });
    if (!goal) throw new Error('Savings goal not found');
    // Refund remaining NGN balance to wallet
    if (goal.currentAmount > 0) {
      const wallet = await walletService.getWallet(userId);
      wallet.balances.NGN += goal.currentAmount;
      await wallet.save();
    }
    return goal;
  }
}

export default new SavingsService();
