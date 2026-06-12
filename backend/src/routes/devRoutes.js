import express from 'express';
import * as walletController from '../controllers/walletController.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

// Only available outside production
router.post('/fund', (req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !process.env.DEMO_MODE) {
    return res.status(404).json({ message: 'Not found' });
  }
  next();
}, authMiddleware, walletController.fundWallet);

export default router;
