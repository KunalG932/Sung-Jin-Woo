
//Used qewertyy's api for reverse image search

const { bot, LOGGER } = require("../index");
const { Token } = require("../config");
const axios = require("axios");

async function edit_msg_cap(msg_id, cap, chatid) {
    try {
        const chatId = chatid;
        const messageId = msg_id;
        const newtext = cap;
        const apiUrl = `https://api.telegram.org/bot${Token}/editMessageText`;

        const payload = {
            chat_id: chatId,
            message_id: messageId,
            text: newtext
        };

        const response = await axios.post(apiUrl, payload);
        return response.status;
    } catch (error) {
        console.error("Error editing message caption:", error);
        return 500;
    }
}

async function get_res(photo, ctx) {
    try {
        const x = await ctx.reply("Searching on Bing.....", { reply_to_message_id: ctx.message.message_id });
        const photo_id = photo.file_id;
        const get_path = (await axios.default.get(`https://api.telegram.org/bot${Token}/getFile?file_id=${photo_id}`)).data;
        const file_path = get_path["result"]["file_path"];
        const result = await axios.default.post(`https://api.qewertyy.dev/image-reverse/bing?img_url=https://api.telegram.org/file/bot${Token}/${file_path}`);
        
        if (result.data.code === 2) {
            let ret_str = "Showing Top 5 results\n\n";
            for (let i = 0; i < 5; i++) {
                ret_str += `${i + 1} : ${result.data.content.bestResults[i].name}\n\n`;
            }
            await edit_msg_cap(x.message_id, ret_str, x.chat.id);
        } else {
            await edit_msg_cap(x.message_id, `Couldn't Find anything Maybe because of ${result.data.message}`, x.chat.id);
        }
    } catch (error) {
        await edit_msg_cap(x.message_id, `An Error Occured while searching \n\nError Message  ${error.response.data.message}`, x.chat.id);
        LOGGER(error);
    }
}

bot.command(["pp", "reverse", "p"], async (ctx) => {
    try {
        if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.photo) {
            await ctx.reply("Reply to a photo to reverse search it.", { reply_to_message_id: ctx.message.message_id });
        } else {
            await get_res(ctx.message.reply_to_message.photo.slice(-1)[0], ctx);
        }
    } catch (error) {
        await LOGGER(error);
    }
});
