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

        let caption = "";
        if (ctx.message.reply_to_message) {
            const repliedUser = ctx.message.reply_to_message.from;
            caption = `Name: ${repliedUser.first_name}\nUser ID: <code>${repliedUser.id}</code>\nMention: <a href="tg://user?id=${repliedUser.id}">${repliedUser.first_name}</a>\nStatus: ${userStatus}.`;
        } else {
            const currentUser = ctx.message.from;
            caption = `Name: ${currentUser.first_name}\nUser ID: <code>${currentUser.id}</code>\nMention: <a href="tg://user?id=${currentUser.id}">${currentUser.first_name}</a>\nStatus: ${userStatus}.`;
        }

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
