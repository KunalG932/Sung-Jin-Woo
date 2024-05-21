const { bot } = require("../index");

bot.command("alive", async (ctx) => {
    try {
        const botInfo = await ctx.telegram.getMe();

        const responseMessage = `
🤖 *Bot Information* 🤖
- Bot Name: ${botInfo.first_name}
- Username: @${botInfo.username}
- ID: ${botInfo.id}
- Status: Online 🟢
`;

        await ctx.replyWithMarkdown(responseMessage, { reply_to_message_id: ctx.message.message_id });
    } catch (error) {
        console.error("Error in /alive command:", error);r
        await ctx.reply("Oops! Something went wrong while checking my status. Please try again later.", { reply_to_message_id: ctx.message.message_id });
    }
});
