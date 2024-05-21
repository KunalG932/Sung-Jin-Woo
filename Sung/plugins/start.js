const { Start_P, Owner_Contact_URL } = require("../config");
const { bot } = require("../index");

// Main start Code //

bot.command("start", async (ctx) => {
    try {
        if (ctx.message.chat.type === "private") {
            const userName = ctx.message.from ? ctx.message.from.first_name : '';
            const inlineKeyboard = {
                inline_keyboard: [
                    [
                        { text: 'Update', url: 'https://t.me/FetchMedia' },
                        { text: 'Owner', url: Owner_Contact_URL }
                    ],
                    [{ text: 'About', callback_data: 'about' }]
                ]
            };
            await ctx.replyWithPhoto(Start_P, {
                caption: `Hello ${userName}! I am JS Bot, here to assist you. Type /help to see the list of available commands.\nI use MongoDB as the database.`,
                reply_to_message_id: ctx.message.message_id,
                reply_markup: JSON.stringify(inlineKeyboard)
            });
        } else if (ctx.message.chat.type === "group" || ctx.message.chat.type === "supergroup") {
            await ctx.reply("Hello everyone! I am alive. Type /help for assistance.", {
                reply_to_message_id: ctx.message.message_id
            });
        }
    } catch (error) {
        console.warn(error);
    }
});

// Handle callback query
bot.on('callback_query', async (ctx) => {
    try {
        const callbackData = ctx.callbackQuery.data;
        const botName = `@${ctx.botInfo.username}`;

        if (callbackData === 'about') {
            // Show About message with a "Back" button
            const inlineKeyboard = {
                inline_keyboard: [
                    [{ text: 'Back', callback_data: 'back' }]
                ]
            };
            await ctx.telegram.editMessageCaption(ctx.chat.id, ctx.callbackQuery.message.message_id, null, `Hey, I'm ${botName}, built in JavaScript using the Telegraf library. I'm still under development, so some features may not work yet.`, { reply_markup: JSON.stringify(inlineKeyboard) });
        } else if (callbackData === 'back') {
            // Show main start message
            const userName = ctx.message && ctx.message.from ? ctx.message.from.first_name : '';
            const inlineKeyboard = {
                inline_keyboard: [
                    [
                        { text: 'Update', url: 'https://t.me/FetchMedia' },
                        { text: 'Owner', url: Owner_Contact_URL }
                    ],
                    [{ text: 'About', callback_data: 'about' }]
                ]
            };
            await ctx.telegram.editMessageCaption(ctx.chat.id, ctx.callbackQuery.message.message_id, null, `Hello ${userName}! I am JS Bot, here to assist you. Type /help to see the list of available commands.\nI use MongoDB as the database.`, { reply_markup: JSON.stringify(inlineKeyboard) });
        }
    } catch (error) {
        console.warn(error);
    }
});
