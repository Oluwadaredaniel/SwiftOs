import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const BASE = process.env.SWIFTYEX_API_BASE_URL || 'https://bot.cordialexchange.com';

class SwiftyExService {
  async getProfile(initData) {
    const { data } = await axios.post(`${BASE}/miniapp/me`, { initData }, { timeout: 8000 });
    return data;
  }

  async getWallets(initData) {
    const { data } = await axios.post(`${BASE}/miniapp/wallets`, { initData }, { timeout: 8000 });
    return data;
  }

  async getTransactions(initData, page = 1, wallet_type = '') {
    const { data } = await axios.post(
      `${BASE}/miniapp/transactions`,
      { initData, page, wallet_type },
      { timeout: 8000 }
    );
    return data;
  }

  async getRates() {
    const { data } = await axios.get(`${BASE}/miniapp/rates`, { timeout: 5000 });
    return data;
  }
}

export default new SwiftyExService();
