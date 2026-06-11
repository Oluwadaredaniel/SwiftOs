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
    const goal = await savingsService.create(req.user._id, req.body);
    res.json({ status: 'success', data: goal });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const depositToGoal = async (req, res) => {
  try {
    const goal = await savingsService.deposit(req.user._id, req.params.id, req.body.amount);
    res.json({ status: 'success', data: goal });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const withdrawFromGoal = async (req, res) => {
  try {
    const goal = await savingsService.withdraw(req.user._id, req.params.id, req.body.amount);
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
