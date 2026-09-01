const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is missing.");
  process.exit(1);
}

const bot = new TelegramBot(token, {
  polling: true
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error.message);
});

bot.onText(/^\/start$/, async (msg) => {
  await bot.sendMessage(
    msg.chat.id,
    "🎨 Welcome to Pixora!\n\nPixora Telegram Bot is online."
  );
});

bot.onText(/^\/help$/, async (msg) => {
  await bot.sendMessage(
    msg.chat.id,
    "Pixora Bot Commands:\n\n/start - Start Pixora\n/help - Show help"
  );
});

bot.on("message", (msg) => {
  if (!msg.text) return;

  if (msg.text.startsWith("/")) {
    return;
  }

  bot.sendMessage(
    msg.chat.id,
    "🤖 Pixora Bot is online.\nUse /help to see available commands."
  );
});

console.log("Pixora Telegram Bot started successfully.");
