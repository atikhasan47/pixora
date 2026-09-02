const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");
const http = require("http");

// ================================
// Environment Variables
// ================================

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 10000;
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5";

if (!TOKEN) {
  console.error("ERROR: TELEGRAM_BOT_TOKEN is missing.");
  process.exit(1);
}

if (!RENDER_URL) {
  console.error("ERROR: RENDER_EXTERNAL_URL is missing.");
  process.exit(1);
}

// ================================
// Telegram Bot
// ================================

const bot = new TelegramBot(TOKEN, {
  polling: false
});

// ================================
// OpenAI
// ================================

let openai = null;

if (OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY
  });

  console.log("OpenAI AI integration enabled.");
} else {
  console.log("OpenAI API key not found. AI mode disabled.");
}

// ================================
// User State
// ================================

const aiMode = new Set();
const userHistory = new Map();

// ================================
// Main Menu
// ================================

function mainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🎨 Pixora Editor",
            callback_data: "editor"
          }
        ],
        [
          {
            text: "🤖 AI Assistant",
            callback_data: "ai"
          }
        ],
        [
          {
            text: "💰 Earning",
            callback_data: "earning"
          },
          {
            text: "👤 Account",
            callback_data: "account"
          }
        ],
        [
          {
            text: "👥 Community",
            callback_data: "community"
          }
        ],
        [
          {
            text: "▶️ YouTube",
            callback_data: "youtube"
          },
          {
            text: "📘 Facebook",
            callback_data: "facebook"
          }
        ],
        [
          {
            text: "❓ Help",
            callback_data: "help"
          }
        ]
      ]
    }
  };
}

// ================================
// /start
// ================================

bot.onText(/^\/start$/, async (msg) => {
  const chatId = msg.chat.id;

  aiMode.delete(chatId);
  userHistory.delete(chatId);

  await bot.sendMessage(
    chatId,
    `👋 Welcome to Pixora!

🎨 Create and edit your content with Pixora.

Choose an option below:`,
    mainMenu()
  );
});

// ================================
// Callback Buttons
// ================================

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  try {
    await bot.answerCallbackQuery(query.id);
  } catch (e) {
    console.error("Callback answer error:", e.message);
  }

  // ================================
  // Pixora Editor
  // ================================

  if (data === "editor") {
    await bot.sendMessage(
      chatId,
      `🎨 Pixora Editor

Open the Pixora Editor below:`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🎨 Open Pixora Editor",
                url: "https://atikhasan47.github.io/pixora/"
              }
            ],
            [
              {
                text: "⬅️ Back to Menu",
                callback_data: "back"
              }
            ]
          ]
        }
      }
    );

    return;
  }

  // ================================
  // AI Assistant
  // ================================

  if (data === "ai") {
    if (!openai) {
      await bot.sendMessage(
        chatId,
        "🤖 AI Assistant is currently unavailable."
      );
      return;
    }

    aiMode.add(chatId);

    userHistory.set(chatId, []);

    await bot.sendMessage(
      chatId,
      `🤖 AI Assistant activated!

Send me a message and I'll try to help you.

To leave AI mode, send /start.`
    );

    return;
  }

  // ================================
  // Earning
  // ================================

  if (data === "earning") {
    await bot.sendMessage(
      chatId,
      `💰 Earning

Your earning system will be available here.

More earning features can be connected later.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⬅️ Back to Menu",
                callback_data: "back"
              }
            ]
          ]
        }
      }
    );

    return;
  }

  // ================================
  // Account
  // ================================

  if (data === "account") {
    await bot.sendMessage(
      chatId,
      `👤 Account

Your Pixora account information will appear here.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⬅️ Back to Menu",
                callback_data: "back"
              }
            ]
          ]
        }
      }
    );

    return;
  }

  // ================================
  // Community
  // ================================

  if (data === "community") {
    await bot.sendMessage(
      chatId,
      `👥 Pixora Community

Join the Pixora community and stay connected.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⬅️ Back to Menu",
                callback_data: "back"
              }
            ]
          ]
        }
      }
    );

    return;
  }

  // ================================
  // YouTube
  // ================================

  if (data === "youtube") {
    await bot.sendMessage(
      chatId,
      "▶️ Pixora YouTube",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "▶️ Open YouTube",
                url: "https://www.youtube.com/"
              }
            ],
            [
              {
                text: "⬅️ Back to Menu",
                callback_data: "back"
              }
            ]
          ]
        }
      }
    );

    return;
  }

  // ================================
  // Facebook
  // ================================

  if (data === "facebook") {
    await bot.sendMessage(
      chatId,
      "📘 Pixora Facebook",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📘 Open Facebook",
                url: "https://www.facebook.com/"
              }
            ],
            [
              {
                text: "⬅️ Back to Menu",
                callback_data: "back"
              }
            ]
          ]
        }
      }
    );

    return;
  }

  // ================================
  // Help
  // ================================

  if (data === "help") {
    await bot.sendMessage(
      chatId,
      `❓ Pixora Help

🎨 Pixora Editor — edit photos and videos
🤖 AI Assistant — chat with AI
💰 Earning — earning features
👤 Account — account information

Use /start to return to the main menu.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⬅️ Back to Menu",
                callback_data: "back"
              }
            ]
          ]
        }
      }
    );

    return;
  }

  // ================================
  // Back
  // ================================

  if (data === "back") {
    await bot.sendMessage(
      chatId,
      "🏠 Pixora Main Menu",
      mainMenu()
    );

    return;
  }
});

// ================================
// AI Messages
// ================================

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  if (!msg.text) return;

  if (msg.text.startsWith("/")) return;

  if (!aiMode.has(chatId)) return;

  if (!openai) {
    await bot.sendMessage(
      chatId,
      "🤖 AI Assistant is currently unavailable."
    );
    return;
  }

  try {
    if (!userHistory.has(chatId)) {
      userHistory.set(chatId, []);
    }

    const history = userHistory.get(chatId);

    history.push({
      role: "user",
      content: msg.text
    });

    const recentHistory = history.slice(-20);

    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      input: recentHistory
    });

    const answer =
      response.output_text ||
      "Sorry, I couldn't generate a response.";

    history.push({
      role: "assistant",
      content: answer
    });

    userHistory.set(chatId, history.slice(-20));

    await bot.sendMessage(chatId, answer);

  } catch (error) {
    console.error(
      "OpenAI error:",
      error?.message || error
    );

    await bot.sendMessage(
      chatId,
      "⚠️ AI response failed. Please try again."
    );
  }
});

// ================================
// HTTP Server
// ================================

const server = http.createServer((req, res) => {

  // Health check
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, {
      "Content-Type": "text/plain"
    });

    res.end("Pixora Telegram Bot is running.");
    return;
  }

  // Telegram Webhook
  if (
    req.method === "POST" &&
    req.url === "/telegram-webhook"
  ) {

    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
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

        console.error(
          "Webhook processing error:",
          error?.message || error
        );

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
// Telegram Webhook Setup
// ================================

async function setupTelegramWebhook() {

  const baseUrl = RENDER_URL.replace(/\/+$/, "");
  const webhookUrl = `${baseUrl}/telegram-webhook`;

  console.log(`Render URL: ${baseUrl}`);
  console.log(`Webhook URL: ${webhookUrl}`);

  try {

    // Check Telegram bot token
    const me = await bot.getMe();

    console.log(
      `Telegram bot authenticated: @${me.username || me.first_name}`
    );

    // Remove old webhook
    await bot.deleteWebHook();

    console.log(
      "Previous Telegram webhook removed."
    );

    // Set new webhook
    await bot.setWebHook(webhookUrl);

    console.log(
      `Telegram webhook set successfully: ${webhookUrl}`
    );

    // Verify webhook
    const webhookInfo = await bot.getWebHookInfo();

    console.log(
      `Webhook verified: ${webhookInfo.url || "not set"}`
    );

    if (webhookInfo.last_error_message) {

      console.error(
        `Telegram webhook last error: ${webhookInfo.last_error_message}`
      );

    }

  } catch (error) {

    console.error("================================");
    console.error("TELEGRAM WEBHOOK SETUP FAILED");
    console.error("================================");

    console.error(
      "Error:",
      error?.message || error
    );

    if (error?.response?.body) {

      console.error(
        "Telegram API response:",
        JSON.stringify(error.response.body)
      );

    }

    console.error(
      "Check TELEGRAM_BOT_TOKEN in Render Environment Variables."
    );

    console.error(
      "Never print or share the token itself."
    );
  }
}

// ================================
// Start Server
// ================================

server.listen(PORT, () => {

  console.log(
    `Pixora Telegram Bot listening on port ${PORT}`
  );

  setupTelegramWebhook();

});
