import express from 'express';
import * as walletController from '../controllers/walletController.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

// Public in a way that we can use it for demo, but still requires auth for the specific user
router.post('/fund', authMiddleware, walletController.fundWallet);

export default router;
