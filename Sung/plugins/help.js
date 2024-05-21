const { bot } = require("../index");

// List of commands with descriptions
const commandsList = [
    { command: "/info", description: "Get information about a user" },
    { command: "/id", description: "Get the user ID" },
    { command: "/ban", description: "Ban a user from the chat" },
    { command: "/unban", description: "Unban a user from the chat" },
    { command: "/mute", description: "Mute a user in the chat" },
    { command: "/unmute", description: "Unmute a user in the chat" },
    { command: "/del", description: "Delete a specific message" },
    { command: "/wipethread", description: "Delete messages in a thread" },
    { command: "/getjson", description: "Get JSON data" },
    { command: "/reverse", description: "Reverse image search" },
    { command: "/pp", description: "Reverse image search" },
    { command: "/p", description: "Reverse image search" },
    { command: "/askgpt", description: "Ask a question using GPT-3" },
    { command: "/palm", description: "Generate text using Palm AI" },
    { command: "/tmute", description: "Temporarily mute a user in the chat" },
    { command: "/tban", description: "Temporarily ban a user from the chat" },
    { command: "/promote", description: "Promote a user to an admin" },
    { command: "/demote", description: "Demote an admin back to a regular user" },
    { command: "/fullpromote", description: "Promote a user with all permissions" },
    { command: "/tgm", description: "Image to link" },
    { command: "/ping", description: "Check if the bot is responsive" }
];

// Number of commands to display per page
const commandsPerPage = 10;

// Function to generate help message for a page
function generateHelpMessage(page) {
    const startIdx = (page - 1) * commandsPerPage;
    const endIdx = Math.min(startIdx + commandsPerPage, commandsList.length);

    let message = `*Commands (Page ${page}):*\n`;
    for (let i = startIdx; i < endIdx; i++) {
        message += `\n${commandsList[i].command}: ${commandsList[i].description}`;
    }

    return message;
}

// Function to generate pagination keyboard
function generatePaginationKeyboard(page) {
    const totalPages = Math.ceil(commandsList.length / commandsPerPage);
    const keyboard = [];

    // Add "Next" button
    if (page < totalPages) {
        keyboard.push([{ text: "Next ➡️", callback_data: `next:${page}` }]);
    }

    // Add "Back" button
    if (page > 1) {
        keyboard.push([{ text: "⬅️ Back", callback_data: `back:${page}` }]);
    }

    // Add "Close" button
    keyboard.push([{ text: "Close ❌", callback_data: "close" }]);

    return keyboard;
}

// Help command
bot.command("help", async (ctx) => {
    let page = 1; 

    // Send initial help message with pagination
    const message = generateHelpMessage(page);
    const keyboard = generatePaginationKeyboard(page);
    await ctx.replyWithMarkdown(message, { reply_markup: { inline_keyboard: keyboard } });
});

// Handle pagination buttons and close button
bot.action(/(next|back|close):(\d+)/, async (ctx) => {
    const [, direction, currentPage] = ctx.match;
    let nextPage = parseInt(currentPage);

    if (direction === "next") {
        nextPage++;
    } else if (direction === "back") {
        nextPage--;
    }

    if (direction === "close") {
        // Delete the help message
        await ctx.deleteMessage();
    } else {
        const message = generateHelpMessage(nextPage);
        const keyboard = generatePaginationKeyboard(nextPage);
        
        // Update the help message with pagination
        await ctx.editMessageText(message, { reply_markup: { inline_keyboard: keyboard }, parse_mode: "Markdown" });
    }
});
