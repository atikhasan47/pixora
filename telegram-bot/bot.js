const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");
const http = require("http");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = Number(process.env.PORT || 10000);
const RENDER_URL = (process.env.RENDER_EXTERNAL_URL || "").replace(/\/+$/, "");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5";

const WEBHOOK_PATH = "/telegram-webhook";
const WEBHOOK_URL = `${RENDER_URL}${WEBHOOK_PATH}`;

if (!TOKEN) {
  console.error("ERROR: TELEGRAM_BOT_TOKEN is missing.");
  process.exit(1);
}

if (!RENDER_URL) {
  console.error("ERROR: RENDER_EXTERNAL_URL is missing.");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, {
  polling: false
});

const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

if (openai) {
  console.log(`OpenAI AI integration enabled. Model: ${OPENAI_MODEL}`);
} else {
  console.warn("OPENAI_API_KEY is missing. AI mode is disabled.");
}

const aiMode = new Set();
const userHistory = new Map();
const busy = new Set();

const MAX_HISTORY = 20;
const TG_LIMIT = 4096;


// =========================
// MAIN MENU
// =========================

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


// =========================
// BACK BUTTON
// =========================

function backMenu() {
  return {
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
  };
}


// =========================
// RESET AI
// =========================

function resetAI(chatId) {
  aiMode.delete(chatId);
  userHistory.delete(chatId);
  busy.delete(chatId);
}


// =========================
// LONG TELEGRAM MESSAGE
// =========================

async function sendLong(chatId, text) {
  const message = String(text || "").trim();

  if (!message) {
    return bot.sendMessage(
      chatId,
      "⚠️ AI returned an empty response. Please try again."
    );
  }

  for (let i = 0; i < message.length; i += TG_LIMIT) {
    await bot.sendMessage(
      chatId,
      message.slice(i, i + TG_LIMIT)
    );
  }
}


// =========================
// /START
// =========================

bot.onText(/^\/start(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;

  resetAI(chatId);

  try {
    await bot.sendMessage(
      chatId,
      `👋 Welcome to Pixora!

🎨 Create and edit your content with Pixora.
🤖 Chat with Pixora AI using AI Assistant.

Choose an option below:`,
      mainMenu()
    );
  } catch (error) {
    console.error(
      "/start error:",
      error.message || error
    );
  }
});


// =========================
// /AI
// =========================

bot.onText(/^\/ai(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;

  if (!openai) {
    return bot.sendMessage(
      chatId,
      "🤖 AI is unavailable.\n\nPlease add OPENAI_API_KEY to Render Environment Variables."
    );
  }

  aiMode.add(chatId);
  userHistory.set(chatId, []);

  await bot.sendMessage(
    chatId,
    `🤖 AI Assistant activated!

Send your message and Pixora AI will reply.

Use /start for the main menu.
Use /stop to leave AI mode.`
  );
});


// =========================
// /STOP
// =========================

bot.onText(/^\/stop(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;

  resetAI(chatId);

  await bot.sendMessage(
    chatId,
    "🛑 AI mode stopped.",
    mainMenu()
  );
});


// =========================
// CALLBACK BUTTONS
// =========================

bot.on("callback_query", async (query) => {
  const chatId = query.message?.chat?.id;
  const data = query.data;

  if (!chatId) return;

  try {
    await bot.answerCallbackQuery(query.id);
  } catch (error) {}

  try {

    // -------------------------
    // EDITOR
    // -------------------------

    if (data === "editor") {
      return bot.sendMessage(
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
    }


    // -------------------------
    // AI
    // -------------------------

    if (data === "ai") {

      if (!openai) {
        return bot.sendMessage(
          chatId,
          "🤖 AI Assistant is unavailable.\n\nAdd OPENAI_API_KEY to Render Environment Variables."
        );
      }

      aiMode.add(chatId);
      userHistory.set(chatId, []);

      return bot.sendMessage(
        chatId,
        `🤖 AI Assistant activated!

Send me a message and Pixora AI will reply.

Use /start or /stop to leave AI mode.`
      );
    }


    // -------------------------
    // EARNING
    // -------------------------

    if (data === "earning") {
      return bot.sendMessage(
        chatId,
        `💰 Earning

Your Pixora earning features can be connected here.`,
        backMenu()
      );
    }


    // -------------------------
    // ACCOUNT
    // -------------------------

    if (data === "account") {
      return bot.sendMessage(
        chatId,
        `👤 Account

Your Pixora account information can be connected here.`,
        backMenu()
      );
    }


    // -------------------------
    // COMMUNITY
    // -------------------------

    if (data === "community") {
      return bot.sendMessage(
        chatId,
        `👥 Pixora Community

Join the Pixora community and stay connected.`,
        backMenu()
      );
    }


    // -------------------------
    // YOUTUBE
    // -------------------------

    if (data === "youtube") {
      return bot.sendMessage(
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
    }


    // -------------------------
    // FACEBOOK
    // -------------------------

    if (data === "facebook") {
      return bot.sendMessage(
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
    }


    // -------------------------
    // HELP
    // -------------------------

    if (data === "help") {
      return bot.sendMessage(
        chatId,
        `❓ Pixora Help

🎨 Pixora Editor
Edit photos and videos.

🤖 AI Assistant
Chat with Pixora AI.

💰 Earning
Earning features.

👤 Account
Account information.

Commands:

/start
/ai
/stop`,
        backMenu()
      );
    }


    // -------------------------
    // BACK
    // -------------------------

    if (data === "back") {
      resetAI(chatId);

      return bot.sendMessage(
        chatId,
        "🏠 Pixora Main Menu",
        mainMenu()
      );
    }

  } catch (error) {
    console.error(
      "Callback error:",
      error.message || error
    );
  }
});


// =========================
// AI MESSAGE HANDLER
// =========================

bot.on("message", async (msg) => {

  const chatId = msg.chat?.id;

  const text =
    typeof msg.text === "string"
      ? msg.text.trim()
      : "";

  // Ignore invalid messages
  if (!chatId) return;

  // Ignore empty messages
  if (!text) return;

  // Ignore commands
  if (text.startsWith("/")) return;

  // Only respond in AI mode
  if (!aiMode.has(chatId)) return;

  // OpenAI not configured
  if (!openai) {
    return bot.sendMessage(
      chatId,
      "🤖 AI is unavailable because OPENAI_API_KEY is not configured."
    );
  }

  // Prevent duplicate requests
  if (busy.has(chatId)) {
    return bot.sendMessage(
      chatId,
      "⏳ Please wait for the previous AI response."
    );
  }

  busy.add(chatId);

  try {

    await bot.sendChatAction(
      chatId,
      "typing"
    ).catch(() => {});


    let history =
      userHistory.get(chatId) || [];


    // User message
    history.push({
      role: "user",
      content: text
    });


    // OpenAI Responses API
    const response =
      await openai.responses.create({

        model: OPENAI_MODEL,

        instructions:
          `You are Pixora AI Assistant.

Be helpful, friendly, concise, and accurate.

Reply in the user's language when practical.

Do not claim to have performed actions you did not perform.`,

        input: history.slice(-MAX_HISTORY)
      });


    const answer =
      String(
        response?.output_text || ""
      ).trim();


    if (!answer) {
      throw new Error(
        "OpenAI returned an empty response"
      );
    }


    // Save AI response
    history.push({
      role: "assistant",
      content: answer
    });


    userHistory.set(
      chatId,
      history.slice(-MAX_HISTORY)
    );


    // Send answer
    await sendLong(
      chatId,
      answer
    );

  } catch (error) {

    console.error(
      "OpenAI error:",
      error?.message || error
    );

    await bot.sendMessage(
      chatId,
      "⚠️ AI response failed. Please try again."
    );

  } finally {

    busy.delete(chatId);

  }
});


// =========================
// HTTP SERVER
// =========================

const server = http.createServer(
  (req, res) => {

    // Health check
    if (
      req.method === "GET" &&
      (
        req.url === "/" ||
        req.url === "/health"
      )
    ) {

      res.writeHead(
        200,
        {
          "Content-Type":
            "text/plain; charset=utf-8"
        }
      );

      return res.end(
        "Pixora Telegram Bot is running."
      );
    }


    // Telegram webhook
    if (
      req.method === "POST" &&
      req.url === WEBHOOK_PATH
    ) {

      let body = "";

      req.setEncoding("utf8");


      req.on(
        "data",
        (chunk) => {
          body += chunk;
        }
      );


      req.on(
        "end",
        () => {

          try {

            const update =
              JSON.parse(body);

            bot.processUpdate(update);


            res.writeHead(
              200,
              {
                "Content-Type":
                  "text/plain; charset=utf-8"
              }
            );

            res.end("OK");

          } catch (error) {

            console.error(
              "Webhook processing error:",
              error.message || error
            );

            res.writeHead(
              400
            );

            res.end(
              "Bad Request"
            );
          }
        }
      );

      return;
    }


    // Unknown route
    res.writeHead(
      404,
      {
        "Content-Type":
          "text/plain; charset=utf-8"
      }
    );

    res.end(
      "Not Found"
    );
  }
);


// =========================
// TELEGRAM WEBHOOK SETUP
// =========================

async function setupTelegramWebhook() {

  console.log(
    `Render URL: ${RENDER_URL}`
  );

  console.log(
    `Webhook URL: ${WEBHOOK_URL}`
  );


  try {

    // Verify bot token
    const me =
      await bot.getMe();

    console.log(
      `Telegram bot authenticated: @${me.username || me.first_name}`
    );


    // Remove old webhook
    await bot.deleteWebHook();


    // Set new webhook
    await bot.setWebHook(
      WEBHOOK_URL
    );


    console.log(
      `Telegram webhook set successfully: ${WEBHOOK_URL}`
    );


    // Verify webhook
    const info =
      await bot.getWebHookInfo();


    console.log(
      `Webhook verified: ${info.url || "not set"}`
    );


    if (
      info.last_error_message
    ) {

      console.error(
        `Telegram webhook last error: ${info.last_error_message}`
      );

    } else {

      console.log(
        "Telegram webhook has no reported error."
      );
    }

  } catch (error) {

    console.error(
      "TELEGRAM WEBHOOK SETUP FAILED:",
      error?.message || error
    );


    if (
      error?.response?.body
    ) {

      console.error(
        "Telegram API response:",
        JSON.stringify(
          error.response.body
        )
      );
    }


    console.error(
      "Check TELEGRAM_BOT_TOKEN and Render Environment Variables. Never print the token itself."
    );
  }
}


// =========================
// START SERVER
// =========================

server.listen(
  PORT,
  async () => {

    console.log(
      `Pixora Telegram Bot listening on port ${PORT}`
    );

    await setupTelegramWebhook();

  }
);
