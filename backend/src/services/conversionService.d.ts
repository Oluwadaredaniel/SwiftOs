/**
 * Service to handle multi-currency conversions and rate fetching.
 * As per IMPLEMENTATION_LOGIC.md:
 * USDT_Amount = (NGN_Amount / Current_Rate) * (1 + Buffer)
 */
declare class ConversionService {
    private readonly DEFAULT_RATE;
    private readonly SLIPPAGE_BUFFER;
    /**
     * Fetches the latest market rates.
     * Currently uses mock but structured to easily swap for SwiftyEx /miniapp/rates
     */
    getLiveRate(): Promise<number>;
    /**
     * Calculates the USDT cost for a given NGN amount.
     * Always rounds UP to 2 decimal places as per BACKEND_INSTRUCTIONS.md
     */
    calculateUSDT(ngnAmount: number): Promise<{
        usdt: number;
        rate: number;
        buffer: number;
    }>;
    /**
     * Calculates NGN equivalent for a USDT amount (without buffer for display)
     */
    calculateNGN(usdtAmount: number): Promise<number>;
}
declare const _default: ConversionService;
export default _default;
//# sourceMappingURL=conversionService.d.ts.map