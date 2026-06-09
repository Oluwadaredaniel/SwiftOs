import { Router } from 'express';
import billService from '../services/billService.js';
import { validateTelegramAuth } from '../middleware/auth.js';
import userService from '../services/userService.js';
const router = Router();
router.get('/providers', validateTelegramAuth, async (req, res) => {
    try {
        const category = req.query.category;
        const providers = await billService.getProviders(category);
        res.json(providers);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/variations', validateTelegramAuth, async (req, res) => {
    try {
        const serviceID = req.query.serviceID;
        const variations = await billService.getVariations(serviceID);
        res.json(variations);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/pay', validateTelegramAuth, async (req, res) => {
    try {
        const telegramUser = req.user;
        const rawInitData = req.rawInitData;
        const user = await userService.getOrCreateUser(telegramUser, rawInitData);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const result = await billService.payBill(user.id, req.body);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=billRoutes.js.map