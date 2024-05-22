const { bot, LOGGER } = require("../index");

async function getUser(ctx, userId) {
    const userProfilePhotos = await ctx.telegram.getUserProfilePhotos(userId);
    const userProfilePic = userProfilePhotos.total_count > 0 ? userProfilePhotos.photos[0][2].file_id : '';

    return {
        userProfilePic
    };
}

const keyboard = [
    [
        { text: "Delete", callback_data: "delete_me" }
    ]
];

const replyMarkup = {
    inline_keyboard: keyboard
};

bot.command("info", async (ctx) => {
    try {
        let userStatus = "Member";
        if (ctx.message.chat.type !== "private") {
            const chatMember = await ctx.telegram.getChatMember(ctx.message.chat.id, ctx.message.reply_to_message ? ctx.message.reply_to_message.from.id : ctx.message.from.id);
            if (chatMember.status === "administrator") {
                userStatus = "Admin";
                if (chatMember.can_promote_members) {
                    userStatus = "Owner";
                }
            } else if (chatMember.status === "creator") {
                userStatus = "Owner";
            } else if (chatMember.status === "left") {
                userStatus = "Left";
            }
        }

        const user = await getUser(ctx, ctx.message.reply_to_message ? ctx.message.reply_to_message.from.id : ctx.message.from.id);
        const userProfilePic = user.userProfilePic;

        let userDetails;
        if (ctx.message.reply_to_message) {
            userDetails = ctx.message.reply_to_message.from;
        } else {
            userDetails = ctx.message.from;
        }

        const { first_name, last_name, username, id } = userDetails;
        const fullName = `${first_name} ${last_name || ''}`.trim();
        const mention = `<a href="tg://user?id=${id}">${first_name}</a>`;
        const userName = username ? `@${username}` : 'Not set';

        const caption = `
Name: ${fullName}
Username: ${userName}
User ID: <code>${id}</code>
Mention: ${mention}
Status: ${userStatus}
`;

        if (userProfilePic !== "") {
            await ctx.replyWithPhoto(userProfilePic, {
                caption: caption,
                parse_mode: "HTML",
                reply_to_message_id: ctx.message.message_id,
                reply_markup: replyMarkup
            });
        } else {
            await ctx.reply(caption, {
                parse_mode: "HTML",
                reply_to_message_id: ctx.message.message_id,
                reply_markup: replyMarkup
            });
        }
    } catch (error) {
        await LOGGER(error);
    }
});

bot.on("callback_query", async (ctx) => {
    try {
        const callbackData = ctx.callbackQuery.data;
        if (callbackData === "delete_me") {
            await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
        }
    } catch (error) {
        await LOGGER(error);
    }
});
