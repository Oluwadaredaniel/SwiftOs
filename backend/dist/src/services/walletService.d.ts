import { Prisma } from '@prisma/client';
declare class WalletService {
    /**
     * Gets multi-currency balances for a user.
     * Merges local shadow ledger with estimated NGN values.
     */
    getBalances(userId: number): Promise<{
        usdt_balance: number;
        usd_balance: number;
        ngn_balance: number;
        ngn_equivalent: number;
        rates: {
            usdt_ngn: number;
        };
        updated_at: Date;
    }>;
    /**
     * Atomically updates a specific balance.
     */
    updateBalance(userId: number, currency: 'usdt' | 'usd' | 'ngn', amount: number): Promise<{
        id: number;
        usdt_balance: Prisma.Decimal;
        usdt_address: string | null;
        usd_balance: Prisma.Decimal;
        ngn_balance: Prisma.Decimal;
        updated_at: Date;
        user_id: number;
    }>;
}
declare const _default: WalletService;
export default _default;
//# sourceMappingURL=walletService.d.ts.map