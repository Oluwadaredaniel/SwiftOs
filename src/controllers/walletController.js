import walletService from '../services/walletService.js';

export const getWallet = async (req, res) => {
  try {
    const wallet = await walletService.getWallet(req.user._id);
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const transfer = async (req, res) => {
  try {
    const { toUserId, amount, currency, description } = req.body;
    const result = await walletService.transfer(req.user._id, toUserId, amount, currency, description);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = await walletService.getHistory(req.user._id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fundWallet = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    const wallet = await walletService.fundWallet(req.user._id, amount, currency);
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
