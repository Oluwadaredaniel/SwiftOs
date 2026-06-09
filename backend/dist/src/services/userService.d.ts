import { Prisma } from '@prisma/client';
declare class UserService {
    /**
     * Finds or creates a user based on Telegram data.
     * Also ensures they have an associated wallet and syncs balance from SwiftyEx.
     */
    getOrCreateUser(telegramData: {
        id: number;
        username?: string;
        first_name?: string;
        photo_url?: string;
    }, initDataString?: string): Promise<({
        wallet: {
            id: number;
            usdt_balance: Prisma.Decimal;
            usdt_address: string | null;
            usd_balance: Prisma.Decimal;
            ngn_balance: Prisma.Decimal;
            updated_at: Date;
            user_id: number;
        } | null;
    } & {
        id: number;
        telegram_id: bigint;
        username: string | null;
        first_name: string | null;
        photo_url: string | null;
        created_at: Date;
    }) | null>;
    getUserById(id: number): Promise<({
        wallet: {
            id: number;
            usdt_balance: Prisma.Decimal;
            usdt_address: string | null;
            usd_balance: Prisma.Decimal;
            ngn_balance: Prisma.Decimal;
            updated_at: Date;
            user_id: number;
        } | null;
    } & {
        id: number;
        telegram_id: bigint;
        username: string | null;
        first_name: string | null;
        photo_url: string | null;
        created_at: Date;
    }) | null>;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=userService.d.ts.map