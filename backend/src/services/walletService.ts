import prisma from '../utils/prisma.js';
import conversionService from './conversionService.js';
import { Prisma } from '@prisma/client';

class WalletService {
  /**
   * Gets multi-currency balances for a user.
   * Merges local shadow ledger with estimated NGN values.
   */
  async getBalances(userId: number) {
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId }
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const liveRate = await conversionService.getLiveRate();

    // Calculate NGN equivalent of the total USDT + USD holdings for display
    const totalUsdtEquivalent = Number(wallet.usdt_balance) + Number(wallet.usd_balance);
    const ngnEquivalent = await conversionService.calculateNGN(totalUsdtEquivalent);

    return {
      usdt_balance: Number(wallet.usdt_balance),
      usd_balance: Number(wallet.usd_balance),
      ngn_balance: Number(wallet.ngn_balance),
      ngn_equivalent: ngnEquivalent,
      rates: {
        usdt_ngn: liveRate
      },
      updated_at: wallet.updated_at
    };
  }

  /**
   * Atomically updates a specific balance.
   */
  async updateBalance(userId: number, currency: 'usdt' | 'usd' | 'ngn', amount: number) {
    const field = `${currency}_balance`;

    return prisma.wallet.update({
      where: { user_id: userId },
      data: {
        [field]: {
          increment: new Prisma.Decimal(amount)
        }
      }
    });
  }
}

export default new WalletService();
