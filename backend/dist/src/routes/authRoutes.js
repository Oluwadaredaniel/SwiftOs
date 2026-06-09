import { Router } from 'express';
import userService from '../services/userService.js';
import { validateTelegramAuth } from '../middleware/auth.js';
const router = Router();
/**
 * Handshake endpoint. Validates Telegram data and ensures user exists.
 */
router.post('/telegram', validateTelegramAuth, async (req, res) => {
    try {
        const telegramUser = req.user;
        const rawInitData = req.rawInitData;
        const user = await userService.getOrCreateUser(telegramUser, rawInitData);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            success: true,
            user: {
                id: user.id,
                telegram_id: user.telegram_id.toString(),
                username: user.username
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to authenticate user' });
    }
});
export default router;
//# sourceMappingURL=authRoutes.js.map