import crypto from 'crypto';
/**
 * Validates the initData sent from Telegram Mini App.
 * Uses the BOT_TOKEN to verify the HMAC signature.
 */
export const validateTelegramAuth = (req, res, next) => {
    const initData = req.headers['x-telegram-init-data'];
    if (!initData) {
        return res.status(401).json({ error: 'Missing Telegram init data' });
    }
    // During development/hackathon, we might want to bypass or mock validation if token is missing
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
        console.warn('TELEGRAM_BOT_TOKEN not found. Authentication bypassed for development.');
        // In dev, we extract the user from the raw initData without signature check
        // Warning: NEVER DO THIS IN PRODUCTION
        try {
            const urlParams = new URLSearchParams(initData);
            const user = JSON.parse(urlParams.get('user') || '{}');
            req.user = user;
            return next();
        }
        catch (e) {
            return res.status(401).json({ error: 'Invalid user data in initData' });
        }
    }
    try {
        const urlParams = new URLSearchParams(initData);
        const hash = urlParams.get('hash');
        urlParams.delete('hash');
        const dataCheckString = Array.from(urlParams.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
        const secretKey = crypto
            .createHmac('sha256', 'WebAppData')
            .update(botToken)
            .digest();
        const hmac = crypto
            .createHmac('sha256', secretKey)
            .update(dataCheckString)
            .digest('hex');
        if (hmac !== hash) {
            return res.status(401).json({ error: 'Invalid authentication signature' });
        }
        const user = JSON.parse(urlParams.get('user') || '{}');
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Internal authentication error' });
    }
};
//# sourceMappingURL=auth.js.map