import express from 'express';
import * as autobillController from '../controllers/autobillController.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', autobillController.createAutoBill);
router.get('/', autobillController.getAutoBills);
router.delete('/:id', autobillController.deleteAutoBill);

export default router;
