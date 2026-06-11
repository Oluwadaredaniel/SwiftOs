import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class NotificationService {
  async sendTelegramMessage(telegramId, message) {
    if (!process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN === 'your_telegram_bot_token') {
      console.log(`[Mock Telegram Notification] to ${telegramId}: ${message}`);
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
      await axios.post(url, {
        chat_id: telegramId,
        text: message,
      });
    } catch (error) {
      console.error('Error sending telegram message:', error.response?.data || error.message);
    }
  }
}

export default new NotificationService();
