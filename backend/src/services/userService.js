import prisma from '../utils/prisma.js';
import { Prisma } from '@prisma/client';
class UserService {
    /**
     * Finds or creates a user based on Telegram data.
     * Also ensures they have an associated wallet.
     */
    async getOrCreateUser(telegramData) {
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