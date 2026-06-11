import express from 'express';
import * as savingsController from '../controllers/savingsController.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/list', savingsController.getGoals);
router.post('/', savingsController.createGoal);
router.post('/:id/deposit', savingsController.depositToGoal);
router.post('/:id/withdraw', savingsController.withdrawFromGoal);
router.delete('/:id', savingsController.deleteGoal);

export default router;
