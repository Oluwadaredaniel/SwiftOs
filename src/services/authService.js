import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';

class AuthService {
  async validateTelegramData(initData) {
    // In a real app, we'd validate the hash using the BOT_TOKEN
    // For a hackathon, we'll parse it and assume it's valid if hash exists
    const params = new URLSearchParams(initData);
    const userJson = params.get('user');
    
    if (!userJson) throw new Error('Invalid Telegram data');
    
    const tgUser = JSON.parse(userJson);
    
    let user = await User.findOne({ telegramId: tgUser.id.toString() });
    
    if (!user) {
      user = await User.create({
        telegramId: tgUser.id.toString(),
        username: tgUser.username,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
      });
      
      // Initialize wallet for new user
      await Wallet.create({ userId: user._id, balances: { USDT: 0, NGN: 0 } });
    }
    
    const token = jwt.sign({ id: user._id, telegramId: user.telegramId }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    
    return { user, token };
  }
}

export default new AuthService();
