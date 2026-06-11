import swiftyexService from './swiftyexService.js';

class RateService {
  constructor() {
    this._cache = null;
    this._cachedAt = 0;
    this._TTL = 60 * 1000;
  }

  async getRates() {
    const now = Date.now();
    if (this._cache && now - this._cachedAt < this._TTL) return this._cache;

    try {
      const data = await swiftyexService.getRates();
      this._cache = data;
      this._cachedAt = now;
      return data;
    } catch (err) {
      console.error('SwiftyEx rates fetch failed, using fallback:', err.message);
      return { buy: 1600, sell: 1580 };
    }
  }

  async getUsdtNgnRate() {
    const rates = await this.getRates();
    return rates.sell || rates.rate || rates.usdt_ngn || 1600;
  }

  async ngnToUsdt(ngnAmount) {
    const rate = await this.getUsdtNgnRate();
    const usdt = (ngnAmount / rate) * 1.02;
    return { usdt: parseFloat(usdt.toFixed(4)), rate, buffer: 0.02 };
  }

  async usdtToNgn(usdtAmount) {
    const rate = await this.getUsdtNgnRate();
    return { ngn: parseFloat((usdtAmount * rate).toFixed(2)), rate };
  }
}

export default new RateService();
