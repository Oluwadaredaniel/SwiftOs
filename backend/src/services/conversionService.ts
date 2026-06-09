import axios from 'axios';

/**
 * CONVERSION SERVICE - The "Brain" of SwiftyOS
 *
 * Handles all multi-currency math and rate fetching.
 * As per IMPLEMENTATION_LOGIC.md:
 * - We prioritize stability by using USDT as the base.
 * - We protect the platform using a 2% slippage buffer.
 * - We ensure precision by rounding UP to 2 decimal places.
 */
class ConversionService {
  // Default rate used as fallback if SwiftyEx API is unavailable
  private readonly DEFAULT_RATE = 1348;

  // 2% buffer to protect against price fluctuations during atomic transactions
  private readonly SLIPPAGE_BUFFER = 0.02;

  /**
   * Fetches the latest market rates from SwiftyEx engine.
   * This ensures the Mini App and Backend are using the same source of truth.
   */
  async getLiveRate(): Promise<number> {
    try {
      const response = await axios.get(`${process.env.SWIFTYEX_API_BASE_URL}/miniapp/rates`);
      // Use the 'sell_rate' as users are typically selling USDT to pay for NGN bills
      return response.data.sell_rate || this.DEFAULT_RATE;
    } catch (error) {
      console.error('Error fetching live rate from SwiftyEx, using default:', error);
      return this.DEFAULT_RATE;
    }
  }

  /**
   * Calculates the USDT cost for a given NGN amount.
   *
   * FORMULA: USDT_Cost = (NGN_Amount / Live_Rate) * (1 + Buffer)
   *
   * @param ngnAmount - The cost of the bill in Nigerian Naira
   * @returns Object containing the calculated USDT, the rate used, and the buffer applied.
   */
  async calculateUSDT(ngnAmount: number): Promise<{
    usdt: number;
    rate: number;
    buffer: number;
  }> {
    const rate = await this.getLiveRate();
    const usdtCost = (ngnAmount / rate) * (1 + this.SLIPPAGE_BUFFER);

    // CRITICAL: Always round UP to 2 decimal places to protect the platform from "dust" losses.
    // This ensures we never undercharge for a bill.
    const roundedUsdt = Math.ceil(usdtCost * 100) / 100;

    return {
      usdt: roundedUsdt,
      rate,
      buffer: this.SLIPPAGE_BUFFER
    };
  }

  /**
   * Calculates NGN equivalent for a USDT amount.
   * Used primarily for UI displays where the user wants to see their USDT value in Naira.
   */
  async calculateNGN(usdtAmount: number): Promise<number> {
    const rate = await this.getLiveRate();
    // Use floor here as we don't want to over-promise NGN value to the user.
    return Math.floor(usdtAmount * rate);
  }
}

export default new ConversionService();
