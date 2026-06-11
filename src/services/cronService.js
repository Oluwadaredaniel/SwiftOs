import cron from 'node-cron';
import AutoBill from '../models/AutoBill.js';
import walletService from './walletService.js';
import notificationService from './notificationService.js';
import User from '../models/User.js';

class CronService {
  init() {
    // Run every minute
    cron.schedule('* * * * *', async () => {
      console.log('Running AutoBill check...');
      const now = new Date();
      const dueBills = await AutoBill.find({
        isActive: true,
        nextDue: { $lte: now },
      });

      for (const bill of dueBills) {
        try {
          const user = await User.findById(bill.userId);
          if (!user) continue;

          await walletService.transfer(
            bill.userId,
            'SYSTEM', // In a real app, this would be the provider's wallet
            bill.amount,
            bill.currency,
            `AutoBill: ${bill.type} (${bill.provider})`
          );

          // Update next due date
          let nextDue = new Date(bill.nextDue);
          if (bill.frequency === 'daily') nextDue.setDate(nextDue.getDate() + 1);
          else if (bill.frequency === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
          else if (bill.frequency === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);

          bill.lastPaid = now;
          bill.nextDue = nextDue;
          await bill.save();

          await notificationService.sendTelegramMessage(
            user.telegramId,
            `✅ AutoBill Success: Your ${bill.type} payment of ${bill.amount} ${bill.currency} to ${bill.provider} was successful.`
          );
        } catch (error) {
          console.error(`Failed to process bill ${bill._id}:`, error.message);
          const user = await User.findById(bill.userId);
          if (user) {
            await notificationService.sendTelegramMessage(
              user.telegramId,
              `❌ AutoBill Failed: Your ${bill.type} payment of ${bill.amount} ${bill.currency} to ${bill.provider} failed due to: ${error.message}`
            );
          }
        }
      }
    });
  }
}

export default new CronService();
