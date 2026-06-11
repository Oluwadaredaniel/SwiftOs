import express from 'express';
import * as aiController from '../controllers/aiController.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/ask', aiController.askAI);

export default router;
