const TelegramBot = require("node-telegram-bot-api");
const http = require("http");

const token = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is missing.");
  process.exit(1);
}

if (!RENDER_URL) {
  console.error("RENDER_EXTERNAL_URL is missing.");
  process.exit(1);
}

const bot = new TelegramBot(token, {
  polling: false
});

// ================================
// Pixora Main Menu
// ================================
function getMainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🎨 Pixora Editor", callback_data: "editor" },
          { text: "💰 Earning", callback_data: "earning" }
        ],
        [
          { text: "👤 My Account", callback_data: "account" },
          { text: "📢 Community", callback_data: "community" }
        ],
        [
          { text: "▶️ YouTube", callback_data: "youtube" },
          { text: "📘 Facebook", callback_data: "facebook" }
        ],
        [
          { text: "ℹ️ Help", callback_data: "help" }
        ]
      ]
    }
  };
}

// ================================
// /start
// ================================
bot.onText(/^\/start$/, async (msg) => {
  try {
    await bot.sendMessage(
      msg.chat.id,
      "🎨 Welcome to Pixora!\n\n" +
      "Your creative world starts here. ✨\n\n" +
      "Choose an option below:",
      getMainMenu()
    );
  } catch (error) {
    console.error("Start command error:", error.message);
  }
});

// ================================
// /help
// ================================
bot.onText(/^\/help$/, async (msg) => {
  try {
    await bot.sendMessage(
      msg.chat.id,
      "ℹ️ Pixora Bot Help\n\n" +
      "/start - Open Pixora menu\n" +
      "/help - Show help\n\n" +
      "Use the buttons below to explore Pixora.",
      getMainMenu()
    );
  } catch (error) {
    console.error("Help command error:", error.message);
  }
});

// ================================
// Button Actions
// ================================
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const action = query.data;

  try {
    await bot.answerCallbackQuery(query.id);

    switch (action) {
      case "editor":
        await bot.editMessageText(
          "🎨 Pixora Editor\n\n" +
          "Create and edit your images with Pixora.\n\n" +
          "🚀 Editor features will be connected here soon.",
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "⬅️ Back", callback_data: "home" }
                ]
              ]
            }
          }
        );
        break;

      case "earning":
        await bot.editMessageText(
          "💰 Pixora Earning\n\n" +
          "Your earning features will appear here.\n\n" +
          "🚀 Earning system will be connected soon.",
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "⬅️ Back", callback_data: "home" }
                ]
              ]
            }
          }
        );
        break;

      case "account":
        await bot.editMessageText(
          "👤 My Account\n\n" +
          `Telegram ID: ${query.from.id}\n` +
          `Name: ${query.from.first_name || "User"}\n\n` +
          "More Pixora account information will be added here.",
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "⬅️ Back", callback_data: "home" }
                ]
              ]
            }
          }
        );
        break;

      case "community":
        await bot.editMessageText(
          "📢 Pixora Community\n\n" +
          "Pixora community links will be connected here.",
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "⬅️ Back", callback_data: "home" }
                ]
              ]
            }
          }
        );
        break;

      case "youtube":
        await bot.editMessageText(
          "▶️ Pixora YouTube\n\n" +
          "Our YouTube channel will be connected here.",
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "⬅️ Back", callback_data: "home" }
                ]
              ]
            }
          }
        );
        break;

      case "facebook":
        await bot.editMessageText(
          "📘 Pixora Facebook\n\n" +
          "Our Facebook page will be connected here.",
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "⬅️ Back", callback_data: "home" }
                ]
              ]
            }
          }
        );
        break;

      case "help":
        await bot.editMessageText(
          "ℹ️ Pixora Bot Help\n\n" +
          "🎨 Pixora Editor - Image editing features\n" +
          "💰 Earning - Earning features\n" +
          "👤 My Account - Your Pixora account\n" +
          "📢 Community - Pixora community\n" +
          "▶️ YouTube - Pixora YouTube\n" +
          "📘 Facebook - Pixora Facebook",
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "⬅️ Back", callback_data: "home" }
                ]
              ]
            }
          }
        );
        break;

      case "home":
        await bot.editMessageText(
          "🎨 Welcome to Pixora!\n\n" +
          "Choose an option below:",
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: getMainMenu().reply_markup
          }
        );
        break;

      default:
        console.log(`Unknown callback action: ${action}`);
    }
  } catch (error) {
    console.error("Button action error:", error.message);
  }
});

// ================================
// Normal Messages
// ================================
bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  try {
    await bot.sendMessage(
      msg.chat.id,
      "🤖 Pixora Bot is online.\n\n" +
      "Please choose an option from the Pixora menu.",
      getMainMenu()
    );
  } catch (error) {
    console.error("Message error:", error.message);
  }
});

// ================================
// HTTP Server for Render
// ================================
const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8"
    });

    res.end("Pixora Telegram Bot is online.");
    return;
  }

  if (req.method === "POST" && req.url === "/telegram-webhook") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", async () => {
      try {
        const update = JSON.parse(body);

        await bot.processUpdate(update);

        res.writeHead(200, {
          "Content-Type": "text/plain"
        });

        res.end("OK");
      } catch (error) {
        console.error("Webhook error:", error.message);

        res.writeHead(400, {
          "Content-Type": "text/plain"
        });

        res.end("Bad Request");
      }
    });

    return;
  }

  res.writeHead(404, {
    "Content-Type": "text/plain"
  });

  res.end("Not Found");
});

// ================================
// Start Server + Set Webhook
// ================================
server.listen(PORT, async () => {
  console.log(`Pixora Telegram Bot listening on port ${PORT}`);

  const webhookUrl = `${RENDER_URL}/telegram-webhook`;

  try {
    await bot.setWebHook(webhookUrl);
    console.log(
      `Telegram webhook set successfully: ${webhookUrl}`
    );
  } catch (error) {
    console.error("Webhook setup error:", error.message);
  }
});
