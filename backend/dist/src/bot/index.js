import { Bot } from 'grammy';
import dotenv from 'dotenv';
dotenv.config();
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.warn('TELEGRAM_BOT_TOKEN not found. Bot will not start.');
}
export const bot = token ? new Bot(token) : null;
if (bot) {
    bot.command('start', (ctx) => {
        const miniAppUrl = `https://t.me/${ctx.me.username}/app`;
        ctx.reply(`Welcome to SwiftyOS! 🚀\n\nYour Telegram-Native Financial OS.\n\nClick below to open the app:`, {
            reply_markup: {
                inline_keyboard: [[
                        { text: "Open SwiftyOS", url: miniAppUrl }
                    ]]
            }
        });
    });
    // Handle errors
    bot.catch((err) => {
        console.error('Bot error:', err);
    });
    // Start the bot
    bot.start();
    console.log('Telegram Bot is running...');
}
//# sourceMappingURL=index.js.map