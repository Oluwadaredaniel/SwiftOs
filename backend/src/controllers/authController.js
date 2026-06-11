import authService from '../services/authService.js';

export const telegramLogin = async (req, res) => {
  try {
    // Accept initData from header OR body (frontend contract uses header)
    const initData = req.headers['x-telegram-init-data'] || req.body.initData;
    if (!initData) return res.status(400).json({ success: false, message: 'Missing initData' });

    const result = await authService.validateTelegramData(initData);

    res.json({
      success: true,
      token: result.token,
      user: {
        id: result.user.telegramId,
        username: result.user.username,
        first_name: result.user.firstName,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.telegramId,
      username: req.user.username,
      first_name: req.user.firstName,
    },
  });
};
