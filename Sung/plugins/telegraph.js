// Import required modules
const { bot, LOGGER } = require("../index");
const { Token } = require("../config");
const axios = require("axios");
const FormData = require("form-data");
const stream = require("stream");

// Function to upload file to Graph.org
async function uploadToGraph(fileData, ctx) {
    try {
        const formData = new FormData();

        // Create a readable stream from the file data
        const readableStream = new stream.PassThrough();
        readableStream.end(fileData);

        // Append the readable stream to FormData
        formData.append("file", readableStream, { filename: "124.jpg" });

        // Make POST request to Graph.org API
        const response = await axios.post("https://graph.org/upload", formData, {
            headers: {
                ...formData.getHeaders(),
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "en-IN,en;q=0.8",
                "Cache-Control": "no-cache",
                "Origin": "https://graph.org",
                "Pragma": "no-cache",
                "Referer": "https://graph.org/",
                "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36"
            }
        });

        // Generate inline keyboard markup with buttons
        const inlineKeyboard = {
            inline_keyboard: [
                [{ text: 'Link', url: `https://graph.org${response.data[0].src}` }],
                [{ text: 'Share Link', switch_inline_query: `https://graph.org${response.data[0].src}` }]
            ]
        };

        // Reply with Graph.org link and buttons
        await ctx.reply(`Here is your Graph.org link.`, {
            reply_to_message_id: ctx.message.message_id,
            parse_mode: "HTML",
            reply_markup: JSON.stringify(inlineKeyboard)
        });
    } catch (error) {
        // Log error
        await LOGGER(error);
    }
}

// Main function to handle bot command
bot.command("tgm", async (ctx) => {
    try {
        if (!ctx.message.reply_to_message) {
            // Reply if no message is replied to
            await ctx.reply("Reply to a message to upload it to Graph.org", {
                reply_to_message_id: ctx.message.message_id
            });
            return;
        }

        const repliedMessage = ctx.message.reply_to_message;

        if (repliedMessage.photo || repliedMessage.animation || repliedMessage.video) {
            if (repliedMessage.photo) {
                // Get file info
                const file = repliedMessage.photo[repliedMessage.photo.length - 1];
                const fileInfo = await ctx.telegram.getFile(file.file_id);
                const imageUrl = `https://api.telegram.org/file/bot${Token}/${fileInfo.file_path}`;

                // Download file
                const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
                const fileBuffer = Buffer.from(response.data);

                // Upload file to Graph.org
                await uploadToGraph(fileBuffer, ctx);
            }
        } else {
            // Reply if message type is not supported
            await ctx.reply("Reply to a file to upload it.", {
                reply_to_message_id: ctx.message.message_id
            });
        }
    } catch (error) {
        // Log error
        await LOGGER(error);
    }
});
