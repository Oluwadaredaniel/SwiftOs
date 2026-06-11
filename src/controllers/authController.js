import authService from '../services/authService.js';

export const telegramLogin = async (req, res) => {
  try {
    const { initData } = req.body;
    const result = await authService.validateTelegramData(initData);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};
