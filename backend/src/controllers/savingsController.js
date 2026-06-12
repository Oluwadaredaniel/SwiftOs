import savingsService from '../services/savingsService.js';

export const getGoals = async (req, res) => {
  try {
    const goals = await savingsService.getAll(req.user._id);
    res.json({
      status: 'success',
      data: goals.map(g => ({
        id: g._id,
        title: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        currency: g.currency,
        category: g.category,
        isCompleted: g.isCompleted,
        createdAt: g.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, currency, category } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      return res.status(400).json({ status: 'error', message: 'name is required' });
    }
    if (!targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
      return res.status(400).json({ status: 'error', message: 'targetAmount must be a positive number' });
    }
    const goal = await savingsService.create(req.user._id, { name: name.trim(), targetAmount: Number(targetAmount), currency, category });
    res.json({ status: 'success', data: goal });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const depositToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ status: 'error', message: 'amount must be a positive number' });
    }
    const goal = await savingsService.deposit(req.user._id, req.params.id, Number(amount));
    res.json({ status: 'success', data: goal });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const withdrawFromGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ status: 'error', message: 'amount must be a positive number' });
    }
    const goal = await savingsService.withdraw(req.user._id, req.params.id, Number(amount));
    res.json({ status: 'success', data: goal });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    await savingsService.delete(req.user._id, req.params.id);
    res.json({ status: 'success', message: 'Goal deleted' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
