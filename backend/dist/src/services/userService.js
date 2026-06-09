import prisma from '../utils/prisma.js';
import { Prisma } from '@prisma/client';
import axios from 'axios';
class UserService {
    /**
     * Finds or creates a user based on Telegram data.
     * Also ensures they have an associated wallet and syncs balance from SwiftyEx.
     */
    async getOrCreateUser(telegramData, initDataString) {
        // Note: telegram_id in schema is BigInt
        const telegramId = BigInt(telegramData.id);
        let user = await prisma.user.findUnique({
            where: { telegram_id: telegramId },
            include: { wallet: true }
        });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    telegram_id: telegramId,
                    username: telegramData.username || null,
                    first_name: telegramData.first_name || null,
                    photo_url: telegramData.photo_url || null,
                    wallet: {
                        create: {
                            usdt_balance: new Prisma.Decimal(0),
                            usd_balance: new Prisma.Decimal(0),
                            ngn_balance: new Prisma.Decimal(0)
                        }
                    }
                },
                include: { wallet: true }
            });
        }
        // SYNC BALANCE FROM SWIFTYEX (IMPLEMENTATION_LOGIC.md - Step 1)
        if (initDataString && user.wallet) {
            try {
                const swiftyExResponse = await axios.post(`${process.env.SWIFTYEX_API_BASE_URL}/miniapp/wallets`, {
                    initData: initDataString
                });
                // Find USDT wallet in SwiftyEx response
                const swiftyWallets = swiftyExResponse.data;
                const usdtWallet = swiftyWallets.find((w) => w.wallet_type === 'usdt');
                const ngnWallet = swiftyWallets.find((w) => w.wallet_type === 'ngn');
                if (usdtWallet || ngnWallet) {
                    await prisma.wallet.update({
                        where: { id: user.wallet.id },
                        data: {
                            usdt_balance: usdtWallet ? new Prisma.Decimal(usdtWallet.balance) : user.wallet.usdt_balance,
                            ngn_balance: ngnWallet ? new Prisma.Decimal(ngnWallet.balance) : user.wallet.ngn_balance,
                            usdt_address: usdtWallet?.deposit_address || user.wallet.usdt_address
                        }
                    });
                    // Refresh user object after sync
                    user = await prisma.user.findUnique({
                        where: { id: user.id },
                        include: { wallet: true }
                    });
                }
            }
            catch (error) {
                console.error('Failed to sync balance with SwiftyEx:', error);
            }
        }
        return user;
    }
    async getUserById(id) {
        return prisma.user.findUnique({
            where: { id },
            include: { wallet: true }
        });
    }
}
export default new UserService();
//# sourceMappingURL=userService.js.map