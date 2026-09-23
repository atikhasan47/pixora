const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");
const http = require("http");

// ======================================================
// CONFIGURATION
// ======================================================

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = Number(process.env.PORT || 10000);

const RENDER_URL = (process.env.RENDER_EXTERNAL_URL || "")
  .replace(/\/+$/, "");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5";

const WEBHOOK_PATH = "/telegram-webhook";
const WEBHOOK_URL = `${RENDER_URL}${WEBHOOK_PATH}`;

// ======================================================
// APP LINKS
// ======================================================

const APP_URL = "https://atikhasan47.github.io/pixora/user.html";
const YOUTUBE_URL = "https://youtube.com/@aiatikfreelanch";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61592860621046";
const TIKTOK_URL = "https://www.tiktok.com/@atikhasan60057";
const TELEGRAM_CHANNEL = "https://t.me/aiatikdailyearnin";
const TELEGRAM_GROUP = "https://t.me/aiatikdailyearning";
const SUPPORT_CONTACT = "@atikbreand420";

// ======================================================
// CHANNEL CONFIGURATION
// ======================================================

const CHANNEL_ID = "-1003950902485";

// Auto Post Timing (সকাল ৯টা, দুপুর ২টা, রাত ৮টা)
const POST_HOURS = [9, 14, 20];

// ======================================================
// VALIDATION
// ======================================================

if (!TOKEN) {
  console.error("ERROR: TELEGRAM_BOT_TOKEN is missing.");
  process.exit(1);
}

if (!RENDER_URL) {
  console.error("ERROR: RENDER_EXTERNAL_URL is missing.");
  process.exit(1);
}

// ======================================================
// TELEGRAM BOT
// ======================================================

const bot = new TelegramBot(TOKEN, {
  polling: false
});

// ======================================================
// OPENAI
// ======================================================

const openai = OPENAI_API_KEY
  ? new OpenAI({ apiKey: OPENAI_API_KEY })
  : null;

if (openai) {
  console.log(`OpenAI enabled. Model: ${OPENAI_MODEL}`);
} else {
  console.warn("OPENAI_API_KEY is missing. AI mode disabled.");
}

// ======================================================
// USER STATE
// ======================================================

const aiMode = new Set();
const userHistory = new Map();
const busy = new Set();

const MAX_HISTORY = 20;
const TELEGRAM_MESSAGE_LIMIT = 4096;

// ======================================================
// MAIN MENU
// ======================================================

function mainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🎯 Open Earning App",
            url: APP_URL
          }
        ],
        [
          {
            text: "💰 Earning Info",
            callback_data: "earn_info"
          }
        ],
        [
          {
            text: "📊 Check Balance",
            callback_data: "balance"
          },
          {
            text: "💸 Withdraw",
            callback_data: "withdraw"
          }
        ],
        [
          {
            text: "📺 YouTube",
            url: YOUTUBE_URL
          },
          {
            text: "📘 Facebook",
            url: FACEBOOK_URL
          }
        ],
        [
          {
            text: "🎵 TikTok",
            url: TIKTOK_URL
          },
          {
            text: "✈️ Telegram",
            url: TELEGRAM_CHANNEL
          }
        ],
        [
          {
            text: "👥 Join Group",
            url: TELEGRAM_GROUP
          }
        ],
        [
          {
            text: "📞 Support",
            callback_data: "support"
          },
          {
            text: "❓ Help",
            callback_data: "help"
          }
        ]
      ]
    }
  };
}

// ======================================================
// BACK MENU
// ======================================================

function backMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🎯 Open App",
            url: APP_URL
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
  };
}

// ======================================================
// RESET AI
// ======================================================

function resetAI(chatId) {
  aiMode.delete(chatId);
  userHistory.delete(chatId);
  busy.delete(chatId);
}

// ======================================================
// SEND LONG MESSAGE
// ======================================================

async function sendLongMessage(chatId, text) {
  const message = String(text || "").trim();

  if (!message) {
    await bot.sendMessage(
      chatId,
      "⚠️ AI returned an empty response. Please try again."
    );
    return;
  }

  for (
    let start = 0;
    start < message.length;
    start += TELEGRAM_MESSAGE_LIMIT
  ) {
    await bot.sendMessage(
      chatId,
      message.slice(start, start + TELEGRAM_MESSAGE_LIMIT)
    );
  }
}

// ======================================================
// CHANNEL AUTO POST
// ======================================================

async function postToChannel() {
  try {
    await bot.sendMessage(
      CHANNEL_ID,
      `💰 *Ai Atik Daily Earning*

📺 Watch Ads — ৳0.10
📅 Daily Job — ৳0.20
🧮 Math Earn — ৳0.04
🛒 Social Promote

🌐 *App:* ${APP_URL}

👇 আয় শুরু করুন 👇`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🎯 Open Earning App",
                url: APP_URL
              }
            ],
            [
              {
                text: "👥 Join Group",
                url: TELEGRAM_GROUP
              }
            ]
          ]
        }
      }
    );

    console.log("✅ Channel-এ Ad Post হয়েছে");

  } catch (error) {
    console.error("Channel Post Error:", error.message);
  }
}

// ======================================================
// AUTO POST TIMER
// ======================================================

setInterval(async () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();

  if (POST_HOURS.includes(hour) && minute === 0) {
    console.log(`⏰ Auto Post Time: ${hour}:00`);
    await postToChannel();
  }
}, 60000);

// ======================================================
// /START
// ======================================================

bot.onText(/^\/start(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from?.first_name || "Friend";

  resetAI(chatId);

  try {
    await bot.sendMessage(
      chatId,
      `🎉 স্বাগতম ${userName}!

🎯 *Ai Atik Daily Earning* — এ স্বাগতম

💰 *আমাদের সার্ভিস:*
📺 Watch Ads — ৳0.10
📅 Daily Job — ৳0.20
🧮 Math Earn — ৳0.04
🛒 Social Promote

🌐 *App:* ${APP_URL}

👇 নিচের Button এ ক্লিক করুন 👇`,
      {
        parse_mode: "Markdown",
        ...mainMenu()
      }
    );
  } catch (error) {
    console.error("/start error:", error.message || error);
  }
});

// ======================================================
// /EARN
// ======================================================

bot.onText(/^\/earn(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    await bot.sendMessage(
      chatId,
      `💰 *Earning Info*

📺 Watch Ads — ৳0.10
📅 Daily Job — ৳0.20
🧮 Math Earn — ৳0.04
🛒 Social Promote — ৳0.50+

🌐 App: ${APP_URL}

👇 আয় শুরু করুন 👇`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🎯 Open Earning App",
                url: APP_URL
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
  } catch (error) {
    console.error("/earn error:", error.message || error);
  }
});

// ======================================================
// /BALANCE
// ======================================================

bot.onText(/^\/balance(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    await bot.sendMessage(
      chatId,
      `📊 *Your Balance*

আপনার Balance দেখতে App-এ Login করুন।

🌐 App: ${APP_URL}

👇 নিচের Button এ ক্লিক করুন 👇`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🎯 Open App & Check Balance",
                url: APP_URL
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
  } catch (error) {
    console.error("/balance error:", error.message || error);
  }
});

// ======================================================
// /WITHDRAW
// ======================================================

bot.onText(/^\/withdraw(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    await bot.sendMessage(
      chatId,
      `💸 *Withdraw Info*

💰 Minimum: ৳110
💸 Fee: ৳10
📱 Bkash / Nagad

Withdraw করতে App-এ যান।

🌐 App: ${APP_URL}

👇 নিচের Button এ ক্লিক করুন 👇`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🎯 Open App & Withdraw",
                url: APP_URL
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
  } catch (error) {
    console.error("/withdraw error:", error.message || error);
  }
});

// ======================================================
// /HELP
// ======================================================

bot.onText(/^\/help(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    await bot.sendMessage(
      chatId,
      `❓ *Help Center*

🎯 *Commands:*
/start — Main Menu
/earn — Earning Info
/balance — Check Balance
/withdraw — Withdraw Info
/help — এই Help
/contact — Admin Support
/ai — AI Assistant
/stop — AI Stop

🌐 *App:* ${APP_URL}

📞 *Support:* ${SUPPORT_CONTACT}`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📞 Contact Admin",
                url: `https://t.me/${SUPPORT_CONTACT.replace("@", "")}`
              }
            ],
            [
              {
                text: "🎯 Open App",
                url: APP_URL
              }
            ]
          ]
        }
      }
    );
  } catch (error) {
    console.error("/help error:", error.message || error);
  }
});

// ======================================================
// /CONTACT
// ======================================================

bot.onText(/^\/contact(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    await bot.sendMessage(
      chatId,
      `📞 *Admin Support*

🎯 *Telegram:* ${SUPPORT_CONTACT}
👥 *Group:* ${TELEGRAM_GROUP}
📢 *Channel:* ${TELEGRAM_CHANNEL}

২৪/৭ আমাদের সাথে যোগাযোগ করুন।`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📞 Contact Admin",
                url: `https://t.me/${SUPPORT_CONTACT.replace("@", "")}`
              }
            ],
            [
              {
                text: "👥 Join Group",
                url: TELEGRAM_GROUP
              }
            ]
          ]
        }
      }
    );
  } catch (error) {
    console.error("/contact error:", error.message || error);
  }
});

// ======================================================
// /AI
// ======================================================

bot.onText(/^\/ai(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;

  if (!openai) {
    await bot.sendMessage(
      chatId,
      "🤖 AI Assistant is unavailable.\n\nOPENAI_API_KEY missing."
    );
    return;
  }

  aiMode.add(chatId);
  userHistory.set(chatId, []);

  await bot.sendMessage(
    chatId,
    `🤖 *AI Assistant activated!*

আপনার প্রশ্ন লিখুন — AI উত্তর দেবে।

/stop — AI বন্ধ করতে`
  );
});

// ======================================================
// /STOP
// ======================================================

bot.onText(/^\/stop(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;

  resetAI(chatId);

  await bot.sendMessage(
    chatId,
    "🛑 AI mode stopped.",
    mainMenu()
  );
});

// ======================================================
// /POST (Admin Only)
// ======================================================

bot.onText(/^\/post(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;

  // শুধু Admin (8819013561) পারবে
  if (userId !== 8819013561) {
    return bot.sendMessage(chatId, "❌ আপনি Admin না।");
  }

  try {
    await postToChannel();
    await bot.sendMessage(chatId, "✅ Channel-এ Post পাঠানো হয়েছে।");
  } catch (error) {
    await bot.sendMessage(chatId, "❌ Post Failed: " + error.message);
  }
});

// ======================================================
// CALLBACK BUTTONS
// ======================================================

bot.on("callback_query", async (query) => {
  const chatId = query.message?.chat?.id;
  const data = query.data;

  if (!chatId) return;

  try {
    await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("Callback error:", error.message || error);
  }

  try {

    if (data === "earn_info") {
      return bot.sendMessage(
        chatId,
        `💰 *Earning Details*

📺 *Watch Ads* — ৳0.10/Ad
📅 *Daily Job* — ৳0.20/Job
🧮 *Math Earn* — ৳0.04/Math
🛒 *Social Promote* — Different Prices

🌐 App: ${APP_URL}`,
        {
          parse_mode: "Markdown",
          ...backMenu()
        }
      );
    }

    if (data === "balance") {
      return bot.sendMessage(
        chatId,
        `📊 *Your Balance*

App-এ Login করে Balance দেখুন।

🌐 ${APP_URL}`,
        {
          parse_mode: "Markdown",
          ...backMenu()
        }
      );
    }

    if (data === "withdraw") {
      return bot.sendMessage(
        chatId,
        `💸 *Withdraw Info*

💰 Minimum: ৳110
💸 Fee: ৳10
📱 Bkash / Nagad

🌐 ${APP_URL}`,
        {
          parse_mode: "Markdown",
          ...backMenu()
        }
      );
    }

    if (data === "support") {
      return bot.sendMessage(
        chatId,
        `📞 *Support Center*

🎯 Telegram: ${SUPPORT_CONTACT}
👥 Group: Join করুন
📢 Channel: Subscribe করুন

২৪/৭ সাপোর্ট।`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "📞 Contact Admin",
                  url: `https://t.me/${SUPPORT_CONTACT.replace("@", "")}`
                }
              ],
              [
                {
                  text: "👥 Join Group",
                  url: TELEGRAM_GROUP
                }
              ],
              [
                {
                  text: "⬅️ Back",
                  callback_data: "back"
                }
              ]
            ]
          }
        }
      );
    }

    if (data === "help") {
      return bot.sendMessage(
        chatId,
        `❓ *Help*

🎯 /start — Main Menu
💰 /earn — Earning Info
📊 /balance — Balance
💸 /withdraw — Withdraw
📞 /contact — Support
🤖 /ai — AI Assistant

🌐 App: ${APP_URL}`,
        {
          parse_mode: "Markdown",
          ...backMenu()
        }
      );
    }

    if (data === "back") {
      resetAI(chatId);
      return bot.sendMessage(
        chatId,
        "🏠 *Main Menu*",
        {
          parse_mode: "Markdown",
          ...mainMenu()
        }
      );
    }

  } catch (error) {
    console.error("Callback error:", error.message || error);
  }
});

// ======================================================
// GROUP WELCOME
// ======================================================

bot.on("new_chat_members", async (msg) => {
  const chatId = msg.chat.id;

  try {
    for (const member of msg.new_chat_members) {
      if (member.is_bot) continue;

      const name = member.first_name || "Friend";

      await bot.sendMessage(
        chatId,
        `🎉 স্বাগতম ${name}!

🎯 *Ai Atik Daily Earning* এ স্বাগতম

💰 আয়ের সুযোগ:
📺 Watch Ads — ৳0.10
📅 Daily Job — ৳0.20
🧮 Math Earn — ৳0.04

🌐 App: ${APP_URL}

👇 আয় শুরু করুন 👇`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🎯 Open Earning App",
                  url: APP_URL
                }
              ],
              [
                {
                  text: "✈️ Join Channel",
                  url: TELEGRAM_CHANNEL
                }
              ]
            ]
          }
        }
      );
    }
  } catch (error) {
    console.error("Welcome error:", error.message || error);
  }
});

// ======================================================
// AI MESSAGE HANDLER
// ======================================================

bot.on("message", async (msg) => {
  const chatId = msg.chat?.id;
  const text = typeof msg.text === "string" ? msg.text.trim() : "";

  if (!chatId || !text) return;
  if (text.startsWith("/")) return;
  if (!aiMode.has(chatId)) return;

  if (!openai) {
    await bot.sendMessage(chatId, "🤖 AI unavailable.");
    return;
  }

  if (busy.has(chatId)) {
    await bot.sendMessage(
      chatId,
      "⏳ Please wait for the previous response."
    );
    return;
  }

  busy.add(chatId);

  try {
    await bot.sendChatAction(chatId, "typing").catch(() => {});

    let history = userHistory.get(chatId) || [];
    history.push({ role: "user", content: text });
    history = history.slice(-MAX_HISTORY);

    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      instructions: `You are Atik Daily Earning AI Assistant. Reply in Bengali when possible. Be helpful and concise.`,
      input: history
    });

    const answer = String(response?.output_text || "").trim();

    if (!answer) throw new Error("Empty response");

    history.push({ role: "assistant", content: answer });
    userHistory.set(chatId, history.slice(-MAX_HISTORY));

    await sendLongMessage(chatId, answer);

  } catch (error) {
    console.error("AI error:", error?.message || error);
    await bot.sendMessage(
      chatId,
      "⚠️ AI response failed. Please try again."
    );
  } finally {
    busy.delete(chatId);
  }
});

// ======================================================
// HTTP SERVER
// ======================================================

const server = http.createServer((req, res) => {

  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Ai Atik Daily Earning Bot is running.");
  }

  if (req.method === "POST" && req.url === WEBHOOK_PATH) {
    let body = "";
    req.setEncoding("utf8");

    req.on("data", (chunk) => { body += chunk; });

    req.on("end", () => {
      try {
        const update = JSON.parse(body);
        bot.processUpdate(update);
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("OK");
      } catch (error) {
        console.error("Webhook error:", error.message || error);
        res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Bad Request");
      }
    });

    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not Found");
});

// ======================================================
// WEBHOOK SETUP
// ======================================================

async function setupTelegramWebhook() {
  console.log(`Render URL: ${RENDER_URL}`);
  console.log(`Webhook URL: ${WEBHOOK_URL}`);

  try {
    const me = await bot.getMe();
    console.log(`Bot authenticated: @${me.username || me.first_name}`);

    await bot.deleteWebHook();
    console.log("Previous webhook removed.");

    await bot.setWebHook(WEBHOOK_URL);
    console.log(`Webhook set: ${WEBHOOK_URL}`);

    const info = await bot.getWebHookInfo();
    console.log(`Webhook verified: ${info.url || "not set"}`);

    if (info.last_error_message) {
      console.error(`Webhook error: ${info.last_error_message}`);
    } else {
      console.log("Webhook has no errors.");
    }

    console.log(`📢 Channel ID: ${CHANNEL_ID}`);
    console.log(`⏰ Auto Post Hours: ${POST_HOURS.join(", ")}`);

  } catch (error) {
    console.error("WEBHOOK SETUP FAILED:", error?.message || error);
  }
}

// ======================================================
// START SERVER
// ======================================================

server.listen(PORT, async () => {
  console.log(`Bot listening on port ${PORT}`);
  await setupTelegramWebhook();
});
