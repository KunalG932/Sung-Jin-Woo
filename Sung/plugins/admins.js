const { bot, LOGGER } = require("../index");
const { TelegramError } = require("telegraf");
const { Owner } = require("../config");

// Some functions //

async function give_rights(ctx, userId) {
    const chatUser = await bot.telegram.getChatMember(ctx.message.chat.id, userId);
    return {
        "status": chatUser.status,
        "can_be_edited": chatUser.can_be_edited,
        "can_manage_chat": chatUser.can_manage_chat,
        "can_change_info": chatUser.can_change_info,
        "can_invite_users": chatUser.can_invite_users,
        "can_delete_messages": chatUser.can_delete_messages,
        "can_restrict_members": chatUser.can_restrict_members,
        "can_pin_messages": chatUser.can_pin_messages,
        "can_manage_topics": chatUser.can_manage_topics,
        "can_promote_members": chatUser.can_promote_members,
        "can_manage_video_chats": chatUser.can_manage_video_chats,
        "is_anonymous": chatUser.is_anonymous,
        "can_manage_voice_chats": chatUser.can_manage_voice_chats
    };
}

async function give_admin_position(ctx, userId, type) {
    try {
        const rights = await give_rights(ctx, userId);

        if (rights["status"] === "creator" || userId === 5146000168) {
            return true;
        } else if (rights["status"] === "administrator") {
            if (type === "can_delete_messages") {
                return rights[type];
            } else if (type === "can_restrict_members") {
                return rights[type];
            }
        } else {
            return null;
        }
    } catch (error) {
        LOGGER(error);
    }
}

/* !--------- Commands ----------! */

// wipethread command

bot.command("wipethread", async (ctx) => {
    try {
        if (ctx.message.chat.type === "private") {
            await ctx.reply("Group Only Command.");
            return;
        }

        const mainUserCan = await give_admin_position(ctx, ctx.message.from.id, "can_delete_messages");

        if (mainUserCan === true) {
            const botInfo = await ctx.telegram.getMe();
            const botCan = await give_admin_position(ctx, botInfo.id, "can_delete_messages");
            if (botCan === true) {
                if (ctx.message.reply_to_message) {
                    const messageId = ctx.message.reply_to_message.message_id;
                    const mainId = ctx.message.message_id;
                    const messageToDelete = ctx.message.text.split(" ")[1];

                    if (typeof messageToDelete === "undefined") {
                        for (let i = messageId; i <= mainId; i++) {
                            try {
                                await ctx.telegram.deleteMessage(ctx.message.chat.id, i);
                            } catch (error) {
                                if (error instanceof TelegramError) {
                                    i++;
                                } else {
                                    i++;
                                }
                            }
                        }
                        await ctx.reply("Wiped Thread Successfully.");
                    } else if (isNaN(parseInt(messageToDelete))) {
                        await ctx.reply("Correct way to use `/wipethread 3`", {
                            parse_mode: "HTML",
                            reply_to_message_id: ctx.message.message_id
                        });
                    } else if (typeof parseInt(messageToDelete) === "number") {
                        if (parseInt(messageToDelete) <= 0) {
                            await ctx.reply("The number of messages to delete should be a non-zero positive number.", {
                                reply_to_message_id: ctx.message.message_id
                            });
                        } else {
                            for (let i = messageId; i <= (parseInt(messageId) + (parseInt(messageToDelete) - 1)); i++) {
                                try {
                                    await ctx.telegram.deleteMessage(ctx.message.chat.id, i);
                                } catch (error) {
                                    if (error instanceof TelegramError) {
                                        i++;
                                    } else {
                                        i++;
                                    }
                                }
                            }
                            await ctx.reply(`Successfully Wiped ${messageToDelete} message.`);
                        }
                    }
                } else {
                    await ctx.reply("Reply to a message to start purging.", {
                        reply_to_message_id: ctx.message.message_id
                    });
                }
            } else if (botCan === null) {
                await ctx.reply("I am not admin here.", {
                    reply_to_message_id: ctx.message.message_id
                });
            } else {
                await ctx.reply("I lack rights please give me rights.", {
                    reply_to_message_id: ctx.message.message_id
                });
            }
        } else if (mainUserCan === null) {
            await ctx.reply("You are not an admin.", {
                reply_to_message_id: ctx.message.message_id
            });
        } else {
            await ctx.reply("You lack rights", {
                reply_to_message_id: ctx.message.message_id
            });
        }
    } catch (error) {
        LOGGER(error);
    }
});

// del Command //

bot.command("del", async (ctx) => {
    try {
        if (ctx.message.chat.type === "private") {
            await ctx.reply("Group Only Command");
            return;
        }

        const mainUserCan = await give_admin_position(ctx, ctx.message.from.id, "can_delete_messages");
        if (mainUserCan === true) {
            const botInfo = await ctx.telegram.getMe();
            const botCan = await give_admin_position(ctx, botInfo.id, "can_delete_messages");
            if (botCan === true) {
                if (ctx.message.reply_to_message) {
                    await ctx.telegram.deleteMessage(ctx.message.chat.id, ctx.message.reply_to_message.message_id);
                    await ctx.telegram.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
                } else {
                    await ctx.reply("Reply to a message to delete it.", {
                        reply_to_message_id: ctx.message.message_id
                    });
                }
            } else if (botCan === null) {
                await ctx.reply("I am not admin here.", {
                    reply_to_message_id: ctx.message.message_id
                });
            } else {
                await ctx.reply("I lack rights please give me rights.", {
                    reply_to_message_id: ctx.message.message_id
                });
            }
        } else if (mainUserCan === null) {
            await ctx.reply("You are not an admin.", {
                reply_to_message_id: ctx.message.message_id
            });
        } else {
            await ctx.reply("You lack rights", {
                reply_to_message_id: ctx.message.message_id
            });
        }
    } catch (error) {
        LOGGER(error);
    }
});

// Bans & Unban //

bot.command("ban", async (ctx) => {
    try {
        if (ctx.message.chat.type === "private") {
            await ctx.reply("This is a group only command");
            return;
        }

        const _bot = await bot.telegram.getMe();
        const bot_can = await give_admin_position(ctx, _bot.id, "can_restrict_members");
        const user_can = await give_admin_position(ctx, ctx.message.from.id, "can_restrict_members");

        if (bot_can === null) {
            await ctx.reply("I am not admin here", { reply_to_message_id: ctx.message.message_id });
            return;
        } else if (bot_can === false) {
            await ctx.reply("I don't have rights.", { reply_to_message_id: ctx.message.message_id });
            return;
        }

        if (user_can) {
            if (ctx.message.reply_to_message) {
                const victim = ctx.message.reply_to_message.from;
                const banHammerUser = ctx.message.from;

                if (victim.id === Owner.id) {
                    await ctx.reply("You can't ban by owner..", { reply_to_message_id: ctx.message.message_id });
                    return;
                } else if (victim.id === banHammerUser.id) {
                    await ctx.reply("You want to ban yourself ?", { reply_to_message_id: ctx.message.message_id });
                    return;
                } else if (victim.id === _bot.id) {
                    await ctx.reply("What did I do now ?", { reply_to_message_id: ctx.message.message_id });
                    return;
                } else if (['creator', 'administrator'].includes((await ctx.telegram.getChatMember(ctx.chat.id, victim.id)).status)) {
                    await ctx.reply("You can't ban an Admin !!", { reply_to_message_id: ctx.message.message_id });
                    return;
                }

                await ctx.banChatMember(victim.id);
                await ctx.reply(`Sucessfully banned ${victim.first_name} from this chat.`);
                return;
            } else {
                await ctx.reply("Reply to a user to ban him from this chat.", { reply_to_message_id: ctx.message.message_id });
            }
        } else if (user_can === null) {
            await ctx.reply("You are not an Admin.", { reply_to_message_id: ctx.message.message_id });
        } else {
            await ctx.reply("You lack Rights.", { reply_to_message_id: ctx.message.message_id });
        }
    } catch (error) {
        LOGGER(error);
    }
});

bot.command("unban", async (ctx) => {
    try {
        const _bot = await bot.telegram.getMe();
        const bot_can = await give_admin_position(ctx, _bot.id, "can_restrict_members");
        const user_can = await give_admin_position(ctx, ctx.message.from.id, "can_restrict_members");

        if (ctx.message.chat.type === "private") {
            await ctx.reply("This is a group only command");
            return;
        }

        if (bot_can === null) {
            await ctx.reply("I am not admin here", { reply_to_message_id: ctx.message.message_id });
            return;
        } else if (bot_can === false) {
            await ctx.reply("I don't have rights.", { reply_to_message_id: ctx.message.message_id });
            return;
        }

        if (user_can) {
            if (ctx.message.reply_to_message) {
                const victim = ctx.message.reply_to_message.from;
                const banHammerUser = ctx.message.from;

                if (victim.id === Owner.id) {
                    await ctx.reply("lmaooooooooo..", { reply_to_message_id: ctx.message.message_id });
                    return;
                } else if (victim.id === banHammerUser.id) {
                    await ctx.reply("Nice reply to yourself !", { reply_to_message_id: ctx.message.message_id });
                    return;
                } else if (victim.id === _bot.id) {
                    await ctx.reply("Ok like what should I do next ?\nPlay Vodoo with you ?", { reply_to_message_id: ctx.message.message_id });
                    return;
                } else if (['creator', 'administrator'].includes((await ctx.telegram.getChatMember(ctx.chat.id, victim.id)).status)) {
                    await ctx.reply("Unaban an Admin ?", { reply_to_message_id: ctx.message.message_id });
                    return;
                }

                await ctx.unbanChatMember(victim.id);
                await ctx.reply(`Sucessfully unbanned ${victim.first_name} from this chat.`);
                return;
            } else {
                await ctx.reply("Reply to a user to unban him from this chat.", { reply_to_message_id: ctx.message.message_id });
            }
        } else if (user_can === null) {
            await ctx.reply("You are not an Admin.", { reply_to_message_id: ctx.message.message_id });
        } else {
            await ctx.reply("You lack Rights.", { reply_to_message_id: ctx.message.message_id });
        }
    } catch (error) {
        LOGGER(error);
    }
});

// tban Command //

bot.command("tban", async (ctx) => {
    try {
        if (ctx.message.chat.type === "private") {
            await ctx.reply("This is a group only command.");
            return;
        }

        const mainUserCan = await give_admin_position(ctx, ctx.message.from.id, "can_restrict_members");
        if (mainUserCan === true) {
            const botInfo = await ctx.telegram.getMe();
            const botCan = await give_admin_position(ctx, botInfo.id, "can_restrict_members");
            if (botCan === true) {
                if (ctx.message.reply_to_message) {
                    const memberToBan = ctx.message.reply_to_message.from;
                    const banDurationStr = ctx.message.text.split(" ")[1];
                    const banDuration = parseDuration(banDurationStr);
                    
                    if (!banDuration) {
                        await ctx.reply("Failed to get specified time: " + 
                                        "0 is not a valid time char; expected one of w/d/h/m (weeks, days, hours, minutes). " +
                                        "Please provide the ban duration in the format: 1w, 2d, 3h, 4m, or combinations thereof. " +
                                        "For example: /tban 1w, /tban 2d, /tban 3h, /tban 4m.");
                        return;
                    }
                    
                    if (memberToBan.id === Owner) {
                        await ctx.reply("You can't ban the owner.");
                        return;
                    }
                    const untilDate = Math.floor(Date.now() / 1000) + banDuration;
                    await ctx.kickChatMember(memberToBan.id, untilDate);
                    await ctx.reply(`Successfully banned ${memberToBan.first_name} for ${banDurationStr}.`);
                } else {
                    await ctx.reply("Reply to a user to ban them.", {
                        reply_to_message_id: ctx.message.message_id
                    });
                }
            } else if (botCan === null) {
                await ctx.reply("I am not admin here.", {
                    reply_to_message_id: ctx.message.message_id
                });
            } else {
                await ctx.reply("I lack rights, please give me rights.", {
                    reply_to_message_id: ctx.message.message_id
                });
            }
        } else if (mainUserCan === null) {
            await ctx.reply("You are not an admin.", {
                reply_to_message_id: ctx.message.message_id
            });
        } else {
            await ctx.reply("You lack rights.", {
                reply_to_message_id: ctx.message.message_id
            });
        }
    } catch (error) {
        LOGGER(error);
    }
});

// Function to parse duration in seconds from the provided string
function parseDuration(durationStr) {
    const regex = /(\d+)([wdhm])/;
    const match = durationStr.match(regex);
    
    if (!match) {
        return null;
    }
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 'w':
            return value * 7 * 24 * 60 * 60; 
        case 'd':
            return value * 24 * 60 * 60; 
        case 'h':
            return value * 60 * 60; 
        case 'm':
            return value * 60; 
        default:
            return null;
    }
}

// mute Command //

bot.command("mute", async (ctx) => {
    try {
        if (ctx.message.chat.type === "private") {
            await ctx.reply("This is a group only command.");
            return;
        }

        const mainUserCan = await give_admin_position(ctx, ctx.message.from.id, "can_restrict_members");
        if (mainUserCan === true) {
            const botInfo = await ctx.telegram.getMe();
            const botCan = await give_admin_position(ctx, botInfo.id, "can_restrict_members");
            if (botCan === true) {
                if (ctx.message.reply_to_message) {
                    const memberToMute = ctx.message.reply_to_message.from;
                    const muteDuration = ctx.message.text.split(" ")[1] || 0;
                    if (memberToMute.id === Owner) {
                        await ctx.reply("You can't mute Shadow Monarch.");
                        return;
                    }
                    await ctx.restrictChatMember(memberToMute.id, {
                        until_date: Math.floor(Date.now() / 1000) + parseInt(muteDuration),
                        can_send_messages: false,
                        can_send_media_messages: false,
                        can_send_polls: false,
                        can_send_other_messages: false,
                        can_add_web_page_previews: false,
                        can_change_info: false,
                        can_invite_users: false,
                        can_pin_messages: false
                    });
                    await ctx.reply(`Successfully muted ${memberToMute.first_name}.`);
                } else {
                    await ctx.reply("Reply to a user to mute them.", {
                        reply_to_message_id: ctx.message.message_id
                    });
                }
            } else if (botCan === null) {
                await ctx.reply("I am not admin here.", {
                    reply_to_message_id: ctx.message.message_id
                });
            } else {
                await ctx.reply("I lack rights, please give me rights.", {
                    reply_to_message_id: ctx.message.message_id
                });
            }
        } else if (mainUserCan === null) {
            await ctx.reply("You are not an admin.", {
                reply_to_message_id: ctx.message.message_id
            });
        } else {
            await ctx.reply("You lack rights.", {
                reply_to_message_id: ctx.message.message_id
            });
        }
    } catch (error) {
        LOGGER(error);
    }
});

// unmute Command //

bot.command("unmute", async (ctx) => {
    try {
        if (ctx.message.chat.type === "private") {
            await ctx.reply("This is a group only command.");
            return;
        }

        const mainUserCan = await give_admin_position(ctx, ctx.message.from.id, "can_restrict_members");
        if (mainUserCan === true) {
            const botInfo = await ctx.telegram.getMe();
            const botCan = await give_admin_position(ctx, botInfo.id, "can_restrict_members");
            if (botCan === true) {
                if (ctx.message.reply_to_message) {
                    const memberToUnmute = ctx.message.reply_to_message.from;
                    await ctx.restrictChatMember(memberToUnmute.id, {
                        until_date: Math.floor(Date.now() / 1000),
                        can_send_messages: true,
                        can_send_media_messages: true,
                        can_send_polls: true,
                        can_send_other_messages: true,
                        can_add_web_page_previews: true,
                        can_change_info: true,
                        can_invite_users: true,
                        can_pin_messages: true
                    });
                    await ctx.reply(`Successfully unmuted ${memberToUnmute.first_name}.`);
                } else {
                    await ctx.reply("Reply to a user to unmute them.", {
                        reply_to_message_id: ctx.message.message_id
                    });
                }
            } else if (botCan === null) {
                await ctx.reply("I am not admin here.", {
                    reply_to_message_id: ctx.message.message_id
                });
            } else {
                await ctx.reply("I lack rights, please give me rights.", {
                    reply_to_message_id: ctx.message.message_id
                });
            }
        } else if (mainUserCan === null) {
            await ctx.reply("You are not an admin.", {
                reply_to_message_id: ctx.message.message_id
            });
        } else {
            await ctx.reply("You lack rights.", {
                reply_to_message_id: ctx.message.message_id
            });
        }
    } catch (error) {
        LOGGER(error);
    }
});

// tmute Command //

bot.command("tmute", async (ctx) => {
    try {
        if (ctx.message.chat.type === "private") {
            await ctx.reply("This is a group only command.");
            return;
        }

        const mainUserCan = await give_admin_position(ctx, ctx.message.from.id, "can_restrict_members");
        if (mainUserCan === true) {
            const botInfo = await ctx.telegram.getMe();
            const botCan = await give_admin_position(ctx, botInfo.id, "can_restrict_members");
            if (botCan === true) {
                if (ctx.message.reply_to_message) {
                    const memberToMute = ctx.message.reply_to_message.from;
                    const muteDuration = ctx.message.text.split(" ")[1];
                    const duration = parseDuration(muteDuration);

                    if (!duration) {
                        await ctx.reply("Failed to get specified time: " + 
                        "0 is not a valid time char; expected one of w/d/h/m (weeks, days, hours, minutes). " +
                        "Please provide the ban duration in the format: 1w, 2d, 3h, 4m, or combinations thereof. " +
                        "For example: /tmute 1w, /tmute 2d, /tmute 3h, /tmute 4m.");
                        return;
                    }

                    if (memberToMute.id === Owner) {
                        await ctx.reply("You can't mute the owner.");
                        return;
                    }

                    await ctx.restrictChatMember(memberToMute.id, {
                        until_date: Math.floor(Date.now() / 1000) + duration,
                        can_send_messages: false,
                        can_send_media_messages: false,
                        can_send_polls: false,
                        can_send_other_messages: false,
                        can_add_web_page_previews: false,
                        can_change_info: false,
                        can_invite_users: false,
                        can_pin_messages: false
                    });
                    await ctx.reply(`Successfully muted ${memberToMute.first_name} for ${muteDuration}.`);
                } else {
                    await ctx.reply("Reply to a user to mute them.", {
                        reply_to_message_id: ctx.message.message_id
                    });
                }
            } else if (botCan === null) {
                await ctx.reply("I am not admin here.", {
                    reply_to_message_id: ctx.message.message_id
                });
            } else {
                await ctx.reply("I lack rights, please give me rights.", {
                    reply_to_message_id: ctx.message.message_id
                });
            }
        } else if (mainUserCan === null) {
            await ctx.reply("You are not an admin.", {
                reply_to_message_id: ctx.message.message_id
            });
        } else {
            await ctx.reply("You lack rights.", {
                reply_to_message_id: ctx.message.message_id
            });
        }
    } catch (error) {
        LOGGER(error);
    }
});

function parseDuration(durationString) {
    const regex = /(\d+w)?(\d+d)?(\d+h)?(\d+m)?/;
    const matches = durationString.match(regex);
    if (!matches) return null;

    let duration = 0;

    if (matches[1]) {
        const weeks = parseInt(matches[1]);
        duration += weeks * 7 * 24 * 60 * 60;
    }

    if (matches[2]) {
        const days = parseInt(matches[2]);
        duration += days * 24 * 60 * 60;
    }

    if (matches[3]) {
        const hours = parseInt(matches[3]);
        duration += hours * 60 * 60;
    }

    if (matches[4]) {
        const minutes = parseInt(matches[4]);
        duration += minutes * 60;
    }

    return duration;
}


// Promote Command //
bot.command("promote", async (ctx) => {
    try {
        if (ctx.message.chat.type === "private") {
            await ctx.reply("This is a group only command.");
            return;
        }

        const mainUserCan = await give_admin_position(ctx, ctx.message.from.id, "can_promote_members");
        if (mainUserCan === true) {
            const botInfo = await ctx.telegram.getMe();
            const botCan = await give_admin_position(ctx, botInfo.id, "can_promote_members");
            if (botCan === true) {
                if (ctx.message.reply_to_message) {
                    const memberToPromote = ctx.message.reply_to_message.from;
                    await ctx.telegram.promoteChatMember(ctx.message.chat.id, memberToPromote.id, {
                        can_change_info: true,
                        can_post_messages: true,
                        can_edit_messages: true,
                        can_delete_messages: true,
                        can_invite_users: true,
                        can_restrict_members: true,
                        can_pin_messages: true,
                        can_promote_members: true
                    });
                    await ctx.reply(`Successfully promoted ${memberToPromote.first_name}.`);
                } else {
                    await ctx.reply("Reply to a user to promote them.", {
                        reply_to_message_id: ctx.message.message_id
                    });
                }
            } else if (botCan === null) {
                await ctx.reply("I am not admin here.", {
                    reply_to_message_id: ctx.message.message_id
                });
            } else {
                await ctx.reply("I lack rights, please give me rights.", {
                    reply_to_message_id: ctx.message.message_id
                });
            }
        } else if (mainUserCan === null) {
            await ctx.reply("You are not an admin.", {
                reply_to_message_id: ctx.message.message_id
            });
        } else {
            await ctx.reply("You lack rights.", {
                reply_to_message_id: ctx.message.message_id
            });
        }
    } catch (error) {
        LOGGER(error);
    }
});
