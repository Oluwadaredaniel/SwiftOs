import express from 'express';
import * as splitController from '../controllers/splitController.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', splitController.createSplit);
router.get('/:id', splitController.getSplit);
router.post('/:id/pay', splitController.paySplit);

export default router;
