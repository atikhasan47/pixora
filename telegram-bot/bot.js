const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");
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
// OpenAI
// ================================

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;

const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5";

// Users currently using AI mode
const aiUsers = new Set();

// AI conversation history
const aiHistory = new Map();

const MAX_HISTORY = 10;

// ================================
// Pixora Main Menu
// ================================

function getMainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🎨 Pixora Editor", callback_data: "editor" },
          { text: "🤖 Pixora AI", callback_data: "ai" }
        ],
        [
          { text: "💰 Earning", callback_data: "earning" },
          { text: "👤 My Account", callback_data: "account" }
        ],
        [
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
// AI Menu
// ================================

function getAIMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🧹 Clear AI Chat",
            callback_data: "ai_clear"
          }
        ],
        [
          {
            text: "⬅️ Back to Menu",
            callback_data: "home"
          }
        ]
      ]
    }
  };
}

// ================================
// AI System Instructions
// ================================

const AI_INSTRUCTIONS = `
You are Pixora AI, the helpful AI assistant inside the Pixora Telegram Bot.

Be friendly, concise, and useful.

You can help users with:
- General questions
- Writing and rewriting
- Coding
- Pixora features
- Video editing ideas
- Creative ideas
- Learning and explanations

Do not claim to have performed actions that you cannot actually perform.

If a user asks about Pixora, explain things clearly and helpfully.

Keep responses suitable for a general audience.
`;

// ================================
// Helpers
// ================================

function clearAIHistory(chatId) {
  aiHistory.delete(chatId);
}

function getAIHistory(chatId) {
  if (!aiHistory.has(chatId)) {
    aiHistory.set(chatId, []);
  }

  return aiHistory.get(chatId);
}

function addAIMessage(chatId, role, content) {
  const history = getAIHistory(chatId);

  history.push({
    role,
    content
  });

  // Keep only recent messages
  while (history.length > MAX_HISTORY) {
    history.shift();
  }
}

function splitMessage(text, maxLength = 4000) {
  const chunks = [];

  if (!text) {
    return chunks;
  }

  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.substring(i, i + maxLength));
  }

  return chunks;
}

// ================================
// /start
// ================================

bot.onText(/^\/start$/, async (msg) => {
  try {
    aiUsers.delete(msg.chat.id);

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
        "/help - Show help\n" +
        "/ai - Start Pixora AI\n" +
        "/aiclear - Clear AI conversation\n\n" +
        "Use the buttons below to explore Pixora.",
      getMainMenu()
    );
  } catch (error) {
    console.error("Help command error:", error.message);
  }
});

// ================================
// /ai
// ================================

bot.onText(/^\/ai$/, async (msg) => {
  try {
    const chatId = msg.chat.id;

    aiUsers.add(chatId);

    await bot.sendMessage(
      chatId,
      "🤖 Pixora AI is ready!\n\n" +
        "Send me your question or message.\n\n" +
        "💡 You can ask about coding, writing, video editing, Pixora, learning and more.\n\n" +
        "Use 🧹 Clear AI Chat to start a fresh conversation.",
      getAIMenu()
    );
  } catch (error) {
    console.error("AI command error:", error.message);
  }
});

// ================================
// /aiclear
// ================================

bot.onText(/^\/aiclear$/, async (msg) => {
  try {
    const chatId = msg.chat.id;

    clearAIHistory(chatId);
    aiUsers.add(chatId);

    await bot.sendMessage(
      chatId,
      "🧹 AI conversation cleared.\n\n" +
        "🤖 Pixora AI is ready for a fresh conversation.",
      getAIMenu()
    );
  } catch (error) {
    console.error("AI clear command error:", error.message);
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

      // ================================
      // AI
      // ================================

      case "ai":

        aiUsers.add(chatId);

        await bot.editMessageText(
          "🤖 Pixora AI\n\n" +
            "AI assistant is ready. ✨\n\n" +
            "Send me any question or message and I'll reply.\n\n" +
            "💡 Try asking:\n" +
            "• Help me write something\n" +
            "• Explain this code\n" +
            "• Give me video editing ideas\n" +
            "• Tell me about Pixora",
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: getAIMenu().reply_markup
          }
        );

        break;

      // ================================
      // AI Clear
      // ================================

      case "ai_clear":

        clearAIHistory(chatId);
        aiUsers.add(chatId);

        await bot.editMessageText(
          "🧹 AI Chat Cleared\n\n" +
            "🤖 Pixora AI is ready for a fresh conversation.\n\n" +
            "Send your next message.",
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: getAIMenu().reply_markup
          }
        );

        break;

      // ================================
      // Editor
      // ================================

      case "editor":

        aiUsers.delete(chatId);

        await bot.editMessageText(
          "🎨 Pixora Editor\n\n" +
            "✨ Create and edit amazing photos and videos with Pixora.\n\n" +
            "🚀 Click the button below to open Pixora:",
          {
            chat_id: chatId,
            message_id: messageId,
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
                    callback_data: "home"
                  }
                ]
              ]
            }
          }
        );

        break;

      // ================================
      // Earning
      // ================================

      case "earning":

        aiUsers.delete(chatId);

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
                  {
                    text: "⬅️ Back to Menu",
                    callback_data: "home"
                  }
                ]
              ]
            }
          }
        );

        break;

      // ================================
      // Account
      // ================================

      case "account":

        aiUsers.delete(chatId);

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
                  {
                    text: "⬅️ Back to Menu",
                    callback_data: "home"
                  }
                ]
              ]
            }
          }
        );

        break;

      // ================================
      // Community
      // ================================

      case "community":

        aiUsers.delete(chatId);

        await bot.editMessageText(
          "📢 Pixora Community\n\n" +
            "Pixora community links will be connected here.",
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "⬅️ Back to Menu",
                    callback_data: "home"
                  }
                ]
              ]
            }
          }
        );

        break;

      // ================================
      // YouTube
      // ================================

      case "youtube":

        aiUsers.delete(chatId);

        await bot.editMessageText(
          "▶️ Pixora YouTube\n\n" +
            "Our YouTube channel will be connected here.",
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "⬅️ Back to Menu",
                    callback_data: "home"
                  }
                ]
              ]
            }
          }
        );

        break;

      // ================================
      // Facebook
      // ================================

      case "facebook":

        aiUsers.delete(chatId);

        await bot.editMessageText(
          "📘 Pixora Facebook\n\n" +
            "Our Facebook page will be connected here.",
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "⬅️ Back to Menu",
                    callback_data: "home"
                  }
                ]
              ]
            }
          }
        );

        break;

      // ================================
      // Help
      // ================================

      case "help":

        aiUsers.delete(chatId);

        await bot.editMessageText(
          "ℹ️ Pixora Bot Help\n\n" +
            "🎨 Pixora Editor - Create and edit photos and videos\n" +
            "🤖 Pixora AI - AI assistant\n" +
            "💰 Earning - Pixora earning features\n" +
            "👤 My Account - Your Telegram account information\n" +
            "📢 Community - Pixora community\n" +
            "▶️ YouTube - Pixora YouTube channel\n" +
            "📘 Facebook - Pixora Facebook page",
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "⬅️ Back to Menu",
                    callback_data: "home"
                  }
                ]
              ]
            }
          }
        );

        break;

      // ================================
      // Home
      // ================================

      case "home":

        aiUsers.delete(chatId);

        await bot.editMessageText(
          "🎨 Welcome to Pixora!\n\n" +
            "Your creative world starts here. ✨\n\n" +
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
// Normal Messages + AI
// ================================

bot.on("message", async (msg) => {

  if (!msg.text || msg.text.startsWith("/")) {
    return;
  }

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  // ================================
  // AI Mode
  // ================================

  if (aiUsers.has(chatId)) {

    if (!openai) {

      await bot.sendMessage(
        chatId,
        "⚠️ Pixora AI is not configured yet.\n\n" +
          "The bot owner needs to add OPENAI_API_KEY to the server Environment Variables."
      );

      return;
    }

    try {

      await bot.sendChatAction(chatId, "typing");

      addAIMessage(
        chatId,
        "user",
        text
      );

      const history = getAIHistory(chatId);

      const response = await openai.responses.create({
        model: OPENAI_MODEL,
        instructions: AI_INSTRUCTIONS,
        input: history
      });

      const answer =
        response.output_text ||
        "Sorry, I couldn't generate a response right now.";

      addAIMessage(
        chatId,
        "assistant",
        answer
      );

      const chunks = splitMessage(answer);

      for (const chunk of chunks) {
        await bot.sendMessage(
          chatId,
          chunk,
          getAIMenu()
        );
      }

    } catch (error) {

      console.error(
        "OpenAI error:",
        error?.message || error
      );

      // Remove failed user message from history
      const history = getAIHistory(chatId);

      if (
        history.length &&
        history[history.length - 1].role === "user"
      ) {
        history.pop();
      }

      await bot.sendMessage(
        chatId,
        "⚠️ Pixora AI couldn't respond right now.\n\n" +
          "Please try again in a moment."
      );
    }

    return;
  }

  // ================================
  // Normal Message
  // ================================

  try {

    await bot.sendMessage(
      chatId,
      "🤖 Pixora Bot is online.\n\n" +
        "Please choose an option from the Pixora menu.",
      getMainMenu()
    );

  } catch (error) {

    console.error(
      "Message error:",
      error.message
    );

  }

});

// ================================
// HTTP Server for Render
// ================================

const server = http.createServer((req, res) => {

  // Health check
  if (
    req.method === "GET" &&
    req.url === "/"
  ) {

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8"
    });

    res.end(
      "Pixora Telegram Bot is online."
    );

    return;
  }

  // Telegram webhook
  if (
    req.method === "POST" &&
    req.url === "/telegram-webhook"
  ) {

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

        console.error(
          "Webhook error:",
          error.message
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
// Start Server + Set Webhook
// ================================

server.listen(PORT, async () => {

  console.log(
    `Pixora Telegram Bot listening on port ${PORT}`
  );

  const webhookUrl =
    `${RENDER_URL}/telegram-webhook`;

  try {

    await bot.setWebHook(webhookUrl);

    console.log(
      `Telegram webhook set successfully: ${webhookUrl}`
    );

  } catch (error) {

    console.error(
      "Webhook setup error:",
      error.message
    );

  }

});
