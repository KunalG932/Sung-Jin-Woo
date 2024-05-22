
const {LOGGER, bot, uptime: getUptime } = require("../index");

// id command
bot.command('id', async (ctx) => {
    try {
        let response = `Chat Id: <code>${ctx.chat.id}</code>\nMessage Id: <code>${ctx.message.message_id}</code>\nYour Id: <code>${ctx.from.id}</code>`;

        if (ctx.message.reply_to_message) {
            const replyMessage = ctx.message.reply_to_message;
            response += `\nReplied Message Id: <code>${replyMessage.message_id}</code>\n${replyMessage.from.first_name}'s Id: <code>${replyMessage.from.id}</code>`;
        } else if (ctx.message.forward_from_chat) {
            const forwardedChat = ctx.message.forward_from_chat;
            response += `\nThis is a message forwarded from chat ${forwardedChat.first_name}: <code>${forwardedChat.id}</code>`;
        } else if (ctx.message.forward_from) {
            const forwardedUser = ctx.message.forward_from;
            response += `\nThis is a message forwarded from ${forwardedUser.first_name}: <code>${forwardedUser.id}</code>`;
        }

        await ctx.replyWithHTML(response, { reply_to_message_id: ctx.message.message_id });
    } catch (error) {
        LOGGER.error('Error processing id command:', error);
        await ctx.reply('An error occurred while processing the id command.');
    }
});

// getjson command
bot.command('getjson', async (ctx) => {
    try {
        const messageJSON = JSON.stringify(ctx.message, null, 2);
        await ctx.replyWithMarkdown(`\`\`\`\n${messageJSON}\n\`\`\``);
    } catch (error) {
        LOGGER.error('Error retrieving message JSON:', error);
        await ctx.reply('An error occurred while retrieving message JSON.');
    }
});

// ping command
bot.command('ping', async (ctx) => {
    try {
        const start = new Date().getTime();
        const message = await ctx.reply('Pinging...');
        const end = new Date().getTime();
        const timeTaken = end - start;
        const uptime = await getUptime();
        const newText = `Ping: <code>${timeTaken}</code> ms\nUptime: <code>${uptime}</code>`;
        await ctx.telegram.editMessageText(ctx.chat.id, message.message_id, undefined, newText, { parse_mode: "HTML" });
    } catch (error) {
        LOGGER.error('Error processing ping command:', error);
        await ctx.reply('An error occurred while processing the ping command.');
    }
});

// admins commands
bot.command('admins', async (ctx) => {
    try {
        if (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup') {
            const admins = await ctx.getChatAdministrators();

            let adminList = '<b>👥 Administrators:</b>\n';
            admins.forEach((admin) => {
                const user = admin.user;
                adminList += `👤 <b>${user.first_name}</b> (@${user.username || 'No username'})\n`;
            });

            const totalAdmins = admins.length;
            adminList += `\n✅ Total number of admins: ${totalAdmins}`;

            await ctx.replyWithHTML(adminList);
        } else {
            await ctx.reply('This command can only be used in a group or supergroup.');
        }
    } catch (error) {
        LOGGER.error('Error retrieving admin list:', error);
        await ctx.reply('An error occurred while retrieving the admin list.');
    }
});
