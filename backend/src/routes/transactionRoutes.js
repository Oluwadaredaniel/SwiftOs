import express from 'express';
import authMiddleware from '../utils/authMiddleware.js';
import { getTransactions } from '../controllers/walletController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/list', getTransactions);

export default router;
