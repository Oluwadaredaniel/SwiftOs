import { Router } from 'express';
import billService from '../services/billService.js';
import { validateTelegramAuth } from '../middleware/auth.js';
import userService from '../services/userService.js';

const router = Router();

router.get('/providers', validateTelegramAuth, async (req, res) => {
  try {
    const category = req.query.category as string;
    const providers = await billService.getProviders(category);
    res.json(providers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/variations', validateTelegramAuth, async (req, res) => {
  try {
    const serviceID = req.query.serviceID as string;
    const variations = await billService.getVariations(serviceID);
    res.json(variations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/pay', validateTelegramAuth, async (req, res) => {
  try {
    const telegramUser = (req as any).user;
    const rawInitData = (req as any).rawInitData;
    const user = await userService.getOrCreateUser(telegramUser, rawInitData);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await billService.payBill(user.id, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
