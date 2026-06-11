import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/list', paymentController.listLinks);
router.post('/', paymentController.createLink);
router.post('/:token/claim', paymentController.claimLink);

export default router;
