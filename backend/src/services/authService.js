import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';

class AuthService {
  verifyTelegramHash(initData) {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) throw new Error('Missing hash in Telegram initData');

    // Build the data-check string: all fields except hash, sorted, joined with \n
    params.delete('hash');
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    // HMAC-SHA256(dataCheckString, HMAC-SHA256("WebAppData", botToken))
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.TELEGRAM_BOT_TOKEN)
      .digest();

    const expectedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (expectedHash !== hash) throw new Error('Invalid Telegram auth signature');
  }

  async validateTelegramData(initData) {
    this.verifyTelegramHash(initData);

    const params = new URLSearchParams(initData);
    const userJson = params.get('user');
    if (!userJson) throw new Error('Missing user in Telegram initData');

    const tgUser = JSON.parse(userJson);

    let user = await User.findOne({ telegramId: tgUser.id.toString() });

    if (!user) {
      user = await User.create({
        telegramId: tgUser.id.toString(),
        username: tgUser.username,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        initData,
      });
      await Wallet.create({ userId: user._id, balances: { USDT: 0, NGN: 0 } });
    } else {
      // Refresh initData on every login — it expires every ~24h
      user.initData = initData;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, telegramId: user.telegramId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { user, token };
  }
}

export default new AuthService();
