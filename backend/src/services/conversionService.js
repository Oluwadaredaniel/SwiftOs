import axios from 'axios';
/**
 * Service to handle multi-currency conversions and rate fetching.
 * As per IMPLEMENTATION_LOGIC.md:
 * USDT_Amount = (NGN_Amount / Current_Rate) * (1 + Buffer)
 */
class ConversionService {
    DEFAULT_RATE = 1348; // Mock rate for hackathon
    SLIPPAGE_BUFFER = 0.02; // 2% platform slippage protection
    /**
     * Fetches the latest market rates.
     * Currently uses mock but structured to easily swap for SwiftyEx /miniapp/rates
     */
    async getLiveRate() {
        try {
            // Future: const response = await axios.get(`${process.env.SWIFTYEX_API_BASE_URL}/miniapp/rates`);
            // return response.data.sell_rate;
            return this.DEFAULT_RATE;
        }
        catch (error) {
            console.error('Error fetching live rate:', error);
            return this.DEFAULT_RATE;
        }
    }
    /**
     * Calculates the USDT cost for a given NGN amount.
     * Always rounds UP to 2 decimal places as per BACKEND_INSTRUCTIONS.md
     */
    async calculateUSDT(ngnAmount) {
        const rate = await this.getLiveRate();
        const usdtCost = (ngnAmount / rate) * (1 + this.SLIPPAGE_BUFFER);
        // Always round UP to 2 decimal places to protect platform from "dust" losses
        const roundedUsdt = Math.ceil(usdtCost * 100) / 100;
        return {
            usdt: roundedUsdt,
            rate,
            buffer: this.SLIPPAGE_BUFFER
        };
    }
    /**
     * Calculates NGN equivalent for a USDT amount (without buffer for display)
     */
    async calculateNGN(usdtAmount) {
        const rate = await this.getLiveRate();
        return Math.floor(usdtAmount * rate);
    }
}
export default new ConversionService();
//# sourceMappingURL=conversionService.js.map