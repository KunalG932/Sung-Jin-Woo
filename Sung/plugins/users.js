
const { bot, uptime, LOGGER } = require("../index");

bot.command("id", async (ctx) =>{
    if (ctx.message.reply_to_message) {
        await ctx.reply(`Chat Id : <code>${ctx.message.chat.id}</code>\nMessage Id : <code>${ctx.message.message_id}</code>\nReplied Message Id : <code>${ctx.message.reply_to_message.message_id}</code>\nYour Id : <code>${ctx.message.from.id}</code>\n${ctx.message.reply_to_message.from.first_name}'s Id : <code>${ctx.message.reply_to_message.from.id}</code>`,{parse_mode : "HTML",reply_to_message_id : ctx.message.message_id})
    } else if (ctx.message.forward_from_chat) {
        await ctx.reply(`Chat Id : <code>${ctx.message.chat.id}</code>\nMessage Id : <code>${ctx.message.message_id}</code>\nReplied Message Id : <code>${ctx.message.reply_to_message.message_id}</code>\nYour Id : <code>${ctx.message.from.id}</code>\nReplied User Id : <code>${ctx.message.reply_to_message.from.id}</code>\nThis is a replied message from chat ${ctx.message.forward_from_chat.first_name} : <code>${ctx.message.forward_from_chat.id}</code>`,{parse_mode : "HTML",reply_to_message_id : ctx.message.message_id})
    } else if (ctx.message.forward_from) {
        await ctx.reply(`Chat Id : <code>${ctx.message.chat.id}</code>\nMessage Id : <code>${ctx.message.message_id}</code>\nReplied Message Id : <code>${ctx.message.reply_to_message.message_id}</code>\nYour Id : <code>${ctx.message.from.id}</code>\nReplied User Id : <code>${ctx.message.reply_to_message.from.id}</code>\nThis is a replied message is forwarded from ${ctx.message.forward_from.first_name} : <code>${ctx.message.forward_from.id}</code>`,{parse_mode : "HTML",reply_to_message_id : ctx.message.message_id})
    } else {
        await ctx.reply(`Chat Id : <code>${ctx.message.chat.id}</code>\nMessage Id : <code>${ctx.message.message_id}</code>\nYour Id : <code>${ctx.message.from.id}</code>`,{parse_mode : "HTML",reply_to_message_id : ctx.message.message_id})
    };
});

bot.command('getjson', async (ctx) => {
    try {
        const messageJSON = JSON.stringify(ctx.message);
        await ctx.replyWithMarkdown(`JSON:\n\`\`\`${messageJSON}\`\`\``);
    } catch (eor) {
        await LOGGER(eor);
    }
});  

bot.command('ping', async (ctx) => {
    try {
        const start = new Date().getTime();
        const message = await ctx.reply('Pinging...',{reply_to_message_id : ctx.message.message_id});
      
        const end = new Date().getTime();
        const timeTaken = end - start;
        const upti = await uptime()
        const newText = `Ping: <code>${timeTaken}</code> ms\n${upti}`;
        await ctx.telegram.editMessageText(ctx.chat.id, message.message_id,undefined, newText,{parse_mode : "HTML"});
    } catch (err) {
        await LOGGER(err);
    }
});
