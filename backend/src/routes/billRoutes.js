import express from 'express';
import * as billController from '../controllers/billController.js';
import authMiddleware from '../utils/authMiddleware.js';

const router = express.Router();

// providers and variations are public (no auth needed for UI to populate dropdowns)
router.get('/providers', billController.getProviders);
router.get('/variations', billController.getVariations);

router.use(authMiddleware);
router.post('/pay', billController.payBill);
router.post('/verify-meter', billController.verifyMeter);

export default router;
