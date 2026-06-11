import express from 'express';
import * as walletController from '../controllers/walletController.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/balances', walletController.getBalances);
router.post('/transfer', walletController.transfer);
router.post('/fund', walletController.fundWallet);
router.post('/convert', walletController.convertCurrency);

export default router;
