import { Router } from 'express';
import walletService from '../services/walletService.js';
import userService from '../services/userService.js';
import { validateTelegramAuth } from '../middleware/auth.js';
const router = Router();
/**
 * Fetches the current user's multi-currency balances.
 */
router.get('/balances', validateTelegramAuth, async (req, res) => {
    try {
        const telegramUser = req.user;
        const rawInitData = req.rawInitData;
        // Find local user by telegram_id and sync
        const user = await userService.getOrCreateUser(telegramUser, rawInitData);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const balances = await walletService.getBalances(user.id);
        res.json(balances);
    }
    catch (error) {
        console.error('Fetch balances error:', error);
        res.status(500).json({ error: 'Failed to retrieve wallet balances' });
    }
});
export default router;
//# sourceMappingURL=walletRoutes.js.map