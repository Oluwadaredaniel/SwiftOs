declare class BillService {
    private readonly VTPASS_BASE_URL;
    private get headers();
    getProviders(category?: string): Promise<any>;
    getVariations(serviceID: string): Promise<any>;
    /**
     * ATOMIC BILL PAYMENT
     * 1. Calculate USDT cost
     * 2. Check & Debit User USDT
     * 3. Call VTpass
     * 4. Refund on failure
     */
    payBill(userId: number, payload: {
        serviceID: string;
        amount: number;
        phone: string;
        variation_code?: string;
    }): Promise<{
        success: boolean;
        data: any;
    }>;
}
declare const _default: BillService;
export default _default;
//# sourceMappingURL=billService.d.ts.map