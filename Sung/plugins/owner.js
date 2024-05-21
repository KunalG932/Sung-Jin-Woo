const { bot, LOGGER } = require("../index");
const { devs, Owner } = require("../config");
const { shellCommand } = require("@jadesrochers/subprocess");

bot.command("save", async (ctx) => {
    try {
        if (ctx.message.from.id === Owner) {
            if (ctx.message.reply_to_message) {
                await ctx.telegram.forwardMessage(
                    Owner,
                    ctx.message.chat.id,
                    ctx.message.reply_to_message.message_id
                );
                await ctx.reply("Saved.", {
                    reply_to_message_id: ctx.message.message_id
                });
            } else {
                await ctx.reply("Reply to a message.", {
                    reply_to_message_id: ctx.message.message_id
                });
            }
        }
    } catch (error) {
        await LOGGER(error);
    }
});

bot.command("self_del", async (ctx) => {
    try {
        const botInfo = await ctx.telegram.getMe();
        if (ctx.message.from.id === Owner) {
            if (ctx.message.reply_to_message.from.id === botInfo.id) {
                await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.reply_to_message.message_id);
            } else {
                await ctx.reply("Reply to a message sent by me.");
            }
        }
    } catch (error) {
        await LOGGER(error);
    }
});

bot.command("sh", async (ctx) => {
    try {
        if (devs.includes(ctx.message.from.id)) {
            const txt = ctx.message.text.split("/sh");
            const shell = await shellCommand(txt[txt.length - 1].trim());
            await ctx.reply(`OUTPUT : \n${shell.stdout}`, {
                reply_to_message_id: ctx.message.message_id
            });
        }
    } catch (error) {
        await ctx.reply(`ERROR : \n${error}`, {
            reply_to_message_id: ctx.message.message_id
        });
        await LOGGER(error);
    }
});
