
// ---------------Imports------------------

const Config = require("./config");
const telegraf = require("telegraf");
const bot = new telegraf.Telegraf(Config.Token);
const fs = require("fs");
const path = require("path");

// -----------------------Main-------------------

async function uptime() {
  const uptime = process.uptime();
  const seconds = uptime.toFixed(0);
  const totalMinutes = Math.floor(seconds / 60);
  const minutes = totalMinutes % 60;
  const remainingSeconds = seconds % 60;
  const hours = Math.floor((totalMinutes / 60) % 24);
  const days = Math.floor(totalMinutes / (60 * 24));

  if (days <= 0) {
    if (hours <= 0) {
      return `Current uptime: <code>${minutes}</code> minutes, <code>${remainingSeconds}</code> seconds`;
    } else {
      return `Current uptime: <code>${hours}</code> hours, <code>${minutes}</code> minutes, <code>${remainingSeconds}</code> seconds`;
    }
  } else {
    return `Current uptime: <code>${days}</code> days, <code>${hours}</code> hours, <code>${minutes}</code> minutes, <code>${remainingSeconds}</code> seconds`;
  }
}

async function LOGGER(error) {
  try {
    await bot.telegram.sendMessage(Config.Support_id, `An Error has Occured :\n${error}`);
    console.log(error);
  } catch (eor) {
    console.warn(error);
  }
}

const pluginsDir = path.join(__dirname, "/plugins/");
fs.readdir(pluginsDir, (err, files) => {
  if (err) {
    console.error("Error reading plugins directory:", err);
    return;
  }
  const modules = files.filter((file) => file.endsWith(".js"));
  modules.forEach((module) => {
    const modulePath = path.join(pluginsDir, module);
    const plugin = require(modulePath);

    if (plugin) {
      console.log(`Loaded plugin module: ${module}`);
    } else {
      console.log(`Invalid plugin module: ${module}`);
    }
  });
});

bot.telegram.sendMessage(Config.Support_id, "Js bot has started");

bot.launch({ dropPendingUpdates: true });

function get_current() {
  const dat = new Date();
  const xyz = Math.floor(+dat / 1000);  
  return xyz;
}

const bomt = {
  bot: bot,
  uptime: uptime,
  LOGGER: LOGGER,
  curtime: get_current
};

module.exports = bomt;
