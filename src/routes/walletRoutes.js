import express from 'express';
import * as walletController from '../controllers/walletController.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', walletController.getWallet);
router.post('/transfer', walletController.transfer);
router.get('/history', walletController.getHistory);

export default router;
