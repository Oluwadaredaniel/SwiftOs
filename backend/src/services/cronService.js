import cron from 'node-cron';
import AutoBill from '../models/AutoBill.js';
import walletService from './walletService.js';
import vtpassService from './vtpassService.js';
import notificationService from './notificationService.js';
import User from '../models/User.js';

class CronService {
  init() {
    cron.schedule('* * * * *', async () => {
      const now = new Date();
      const dueBills = await AutoBill.find({ isActive: true, nextDue: { $lte: now } });

      for (const bill of dueBills) {
        const user = await User.findById(bill.userId);
        if (!user) continue;

        try {
          // 1. Deduct from wallet first
          await walletService.transfer(
            bill.userId,
            'SYSTEM',
            bill.amount,
            bill.currency,
            `AutoBill: ${bill.type} (${bill.provider})`
          );

          // 2. Call VTpass to actually deliver the service
          let vtpassResult;
          if (bill.type === 'Airtime') {
            vtpassResult = await vtpassService.buyAirtime({
              provider: bill.provider,
              phone: bill.billersCode,
              amount: bill.amount,
            });
          } else if (bill.type === 'Data') {
            vtpassResult = await vtpassService.buyData({
              provider: bill.provider,
              phone: bill.billersCode,
              variationCode: bill.variationCode,
              amount: bill.amount,
            });
          } else if (bill.type === 'Electricity') {
            vtpassResult = await vtpassService.payElectricity({
              provider: bill.provider,
              meterNumber: bill.billersCode,
              variationCode: bill.variationCode || 'prepaid',
              amount: bill.amount,
              phone: user.telegramId, // fallback; ideally store a contact phone
            });
          }

          // 3. Advance next due date
          let nextDue = new Date(bill.nextDue);
          if (bill.frequency === 'daily') nextDue.setDate(nextDue.getDate() + 1);
          else if (bill.frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
          else if (bill.frequency === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);

          bill.lastPaid = now;
          bill.nextDue = nextDue;
          await bill.save();

          await notificationService.sendTelegramMessage(
            user.telegramId,
            `✅ AutoBill paid: ${bill.type} (${bill.provider}) — ${bill.amount} ${bill.currency}`
          );
        } catch (error) {
          console.error(`AutoBill ${bill._id} failed:`, error.message);

          // Refund wallet if VTpass failed after deduction
          if (error.message.includes('VTpass')) {
            await walletService.fundWallet(bill.userId, bill.amount, bill.currency);
          }

          if (user) {
            await notificationService.sendTelegramMessage(
              user.telegramId,
              `❌ AutoBill failed: ${bill.type} (${bill.provider}) — ${error.message}`
            );
          }
        }
      }
    });
  }
}

export default new CronService();
