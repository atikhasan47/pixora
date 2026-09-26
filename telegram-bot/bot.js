const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");
const http = require("http");

// ======================================================
// CONFIGURATION
// ======================================================

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = Number(process.env.PORT || 10000);
const RENDER_URL = (process.env.RENDER_EXTERNAL_URL || "").replace(/\/+$/, "");
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
const TELEGRAM_CHANNEL = "https://t.me/atikbreand420";
const TELEGRAM_GROUP = "https://t.me/aiatikdailyearning";
const SUPPORT_CONTACT = "@atikbreand420";
const SUPPORT_EMAIL = "support@atikearning.com";

// ======================================================
// MONETAG AD LINKS (Random)
// ======================================================

const AD_LINKS = [
  "https://omg10.com/4/11796327",
  "https://omg10.com/4/11867674",
  "https://omg10.com/4/11898024"
];

function getRandomAdLink() {
  return AD_LINKS[Math.floor(Math.random() * AD_LINKS.length)];
}

// ======================================================
// CHANNEL
// ======================================================

const CHANNEL_ID = "-1003950902485";
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
// BOT + OPENAI
// ======================================================

const bot = new TelegramBot(TOKEN, { polling: false });
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

if (openai) console.log(`OpenAI enabled. Model: ${OPENAI_MODEL}`);
else console.warn("OPENAI_API_KEY is missing. AI mode disabled.");

// ======================================================
// STATE
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
        [{ text: "🎁 Special Offer", url: getRandomAdLink() }],
        [{ text: "💰 Earning Info", callback_data: "earn_info" }],
        [
          { text: "📊 Check Balance", callback_data: "balance" },
          { text: "💸 Withdraw", callback_data: "withdraw" }
        ],
        [{ text: "👥 Join Group", url: TELEGRAM_GROUP }],
        [
          { text: "🆘 Support", callback_data: "support" },
          { text: "❓ Help", callback_data: "help" }
        ],
        [{ text: "🌐 Open App", url: APP_URL }]
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
        [{ text: "🎁 Special Offer", url: getRandomAdLink() }],
        [{ text: "🌐 Open App", url: APP_URL }],
        [{ text: "🔙 Back to Menu", callback_data: "back" }]
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
// LONG MESSAGE
// ======================================================

async function sendLongMessage(chatId, text) {
  const message = String(text || "").trim();
  if (!message) {
    return bot.sendMessage(chatId, "⚠️ AI খালি উত্তর দিয়েছে। আবার চেষ্টা করুন।");
  }
  for (let start = 0; start < message.length; start += TELEGRAM_MESSAGE_LIMIT) {
    await bot.sendMessage(chatId, message.slice(start, start + TELEGRAM_MESSAGE_LIMIT));
  }
}

// ======================================================
// CHANNEL AUTO POST
// ======================================================

async function postToChannel() {
  try {
    await bot.sendMessage(
      CHANNEL_ID,
      `💰 *Ai Atik Daily Earning*\n\n📺 Watch Ads — ৳0.10\n📅 Daily Job — ৳0.20\n🧮 Math Earn — ৳0.04\n🛒 Social Promote\n\n🌐 *App:* ${APP_URL}\n\n👇 আয় শুরু করুন 👇`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎁 Special Offer", url: getRandomAdLink() }],
            [{ text: "🌐 Open App", url: APP_URL }],
            [{ text: "👥 Join Group", url: TELEGRAM_GROUP }]
          ]
        }
      }
    );
    console.log("✅ Channel Post Done");
  } catch (err) {
    console.error("Channel Post Error:", err.message);
  }
}

setInterval(async () => {
  const now = new Date();
  if (POST_HOURS.includes(now.getHours()) && now.getMinutes() === 0) {
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
      `🎉 স্বাগতম ${userName}!\n\n🎯 *Ai Atik Daily Earning* — এ স্বাগতম\n\n💰 *আমাদের সার্ভিস:*\n📺 Watch Ads — ৳0.10\n📅 Daily Job — ৳0.20\n🧮 Math Earn — ৳0.04\n🛒 Social Promote — বিভিন্ন প্রাইস\n\n🌐 *App:* ${APP_URL}\n\n👇 নিচের Button এ ক্লিক করুন 👇`,
      { parse_mode: "Markdown", ...mainMenu() }
    );
  } catch (err) { console.error("/start error:", err.message); }
});

// ======================================================
// CALLBACK BUTTONS
// ======================================================

bot.on("callback_query", async (query) => {
  const chatId = query.message?.chat?.id;
  const data = query.data;
  if (!chatId) return;
  try { await bot.answerCallbackQuery(query.id); } catch (e) {}

  try {
    // ==== 💰 EARNING INFO ====
    if (data === "earn_info") {
      return bot.sendMessage(
        chatId,
        `💰 *ইনকামের বিবরণ (Earning Details)*\n\n📺 Watch Ads — ৳0.10/Ad\n📅 Daily Job — ৳0.20/Job\n🧮 Math Earn — ৳0.04/Math\n🛒 Social Promote — Various Prices\n\n🌐 App: ${APP_URL}`,
        { parse_mode: "Markdown", ...backMenu() }
      );
    }

    // ==== 📊 BALANCE ====
    if (data === "balance") {
      return bot.sendMessage(
        chatId,
        `📊 *আপনার ব্যালেন্স চেক করুন*\n\n💵 বর্তমান ব্যালেন্স: ৳ [ব্যবহারকারীর ব্যালেন্স]\n💰 মোট আয়: ৳ [মোট আয়]\n📺 দেখা অ্যাড: [অ্যাড সংখ্যা]\n🧮 ম্যাথ সলভ: [ম্যাথ সংখ্যা]\n\n🏧 উইথড্র করতে:\nন্যূনতম ৳2780 প্রয়োজন।\n\n🌐 অ্যাপে যান:\n${APP_URL}`,
        { parse_mode: "Markdown", ...backMenu() }
      );
    }

    // ==== 💸 WITHDRAW ====
    if (data === "withdraw") {
      return bot.sendMessage(
        chatId,
        `💸 *উইথড্র রিকোয়েস্ট*\n\n🏧 ন্যূনতম উইথড্র: ৳2780\n💸 ফি: ৳40\n📅 সময়: ৫ দিনে একবার\n\n📱 পেমেন্ট মেথড:\n✅ bKash\n✅ Nagad\n\n📌 কীভাবে উইথড্র করবেন:\n১. ওয়েবসাইটে লগইন করুন।\n২. উইথড্র পেজে যান।\n৩. আপনার bKash/Nagad নম্বর দিন।\n৪. অ্যামাউন্ট লিখে সাবমিট করুন।\n৫. ২৪-৪৮ ঘণ্টার মধ্যে পেমেন্ট পাবেন।\n\n🌐 উইথড্র করতে ক্লিক করুন:\n${APP_URL}`,
        { parse_mode: "Markdown", ...backMenu() }
      );
    }

    // ==== 🆘 SUPPORT ====
    if (data === "support") {
      return bot.sendMessage(
        chatId,
        `🆘 *Support Center*\n\n📞 টেলিগ্রাম: ${SUPPORT_CONTACT}\n📧 ইমেইল: ${SUPPORT_EMAIL}\n\n২৪/৭ আমাদের সাথে যোগাযোগ করুন।`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🆘 Contact Support", url: `https://t.me/${SUPPORT_CONTACT.replace("@", "")}` }],
              [{ text: "👥 Join Group", url: TELEGRAM_GROUP }],
              [{ text: "🔙 Back to Menu", callback_data: "back" }]
            ]
          }
        }
      );
    }

    // ==== ❓ HELP ====
    if (data === "help") {
      return bot.sendMessage(
        chatId,
        `❓ *Help & Support*\n\n📌 *কীভাবে অ্যাপ ব্যবহার করবেন:*\n১. ওয়েবসাইটে যান এবং রেজিস্ট্রেশন করুন।\n২. অ্যাড দেখুন এবং ম্যাথ সলভ করে আয় করুন।\n৩. ব্যালেন্স ৳2780 হলে উইথড্র করুন।\n৪. প্রতিদিন ২০টি অ্যাড এবং ২০টি ম্যাথ লিমিট।\n\n📌 *সাধারণ সমস্যা:*\n❌ লগইন না হলে → পাসওয়ার্ড রিসেট করুন।\n❌ অ্যাড না এলে → ইন্টারনেট চেক করুন।\n❌ উইথড্র না হলে → সাপোর্টে যোগাযোগ করুন।\n\n📞 সাপোর্ট:\nTelegram: t.me/atikbreand420\n📧 Email: ${SUPPORT_EMAIL}\n\n💡 আরও জানতে:\n${APP_URL}`,
        { parse_mode: "Markdown", ...backMenu() }
      );
    }

    // ==== 🔙 BACK ====
    if (data === "back") {
      resetAI(chatId);
      return bot.sendMessage(chatId, "🏠 *Main Menu*", {
        parse_mode: "Markdown",
        ...mainMenu()
      });
    }
  } catch (err) {
    console.error("Callback error:", err.message);
  }
});

// ======================================================
// /HELP, /BALANCE, /WITHDRAW (Text Commands)
// ======================================================

bot.onText(/^\/help(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;
  return bot.sendMessage(
    chatId,
    `❓ *Help & Support*\n\n📌 *কীভাবে অ্যাপ ব্যবহার করবেন:*\n১. ওয়েবসাইটে যান এবং রেজিস্ট্রেশন করুন।\n২. অ্যাড দেখুন এবং ম্যাথ সলভ করে আয় করুন।\n৩. ব্যালেন্স ৳2780 হলে উইথড্র করুন।\n৪. প্রতিদিন ২০টি অ্যাড এবং ২০টি ম্যাথ লিমিট।\n\n📞 সাপোর্ট: t.me/atikbreand420\n📧 Email: ${SUPPORT_EMAIL}\n\n💡 আরও জানতে:\n${APP_URL}`,
    { parse_mode: "Markdown", ...backMenu() }
  );
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
        `🎉 স্বাগতম ${name}!\n\n🎯 *Ai Atik Daily Earning* এ স্বাগতম\n\n💰 আয়ের সুযোগ:\n📺 Watch Ads — ৳0.10\n📅 Daily Job — ৳0.20\n🧮 Math Earn — ৳0.04\n\n🌐 App: ${APP_URL}`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🎁 Special Offer", url: getRandomAdLink() }],
              [{ text: "🌐 Open App", url: APP_URL }],
              [{ text: "✈️ Join Channel", url: TELEGRAM_CHANNEL }]
            ]
          }
        }
      );
    }
  } catch (err) { console.error("Welcome error:", err.message); }
});

// ======================================================
// /AI, /STOP, /POST
// ======================================================

bot.onText(/^\/ai(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;
  if (!openai) return bot.sendMessage(chatId, "🤖 AI Assistant এখন কাজ করছে না।");
  aiMode.add(chatId);
  userHistory.set(chatId, []);
  await bot.sendMessage(chatId, `🤖 *AI Assistant চালু হয়েছে!*\n\nআপনার প্রশ্ন লিখুন — AI উত্তর দেবে।\n\n/stop — AI বন্ধ করতে`);
});

bot.onText(/^\/stop(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;
  resetAI(chatId);
  await bot.sendMessage(chatId, "🛑 AI mode বন্ধ হয়েছে।", mainMenu());
});

bot.onText(/^\/post(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;
  if (msg.from?.id !== 8819013561) return bot.sendMessage(chatId, "❌ আপনি Admin না।");
  try {
    await postToChannel();
    await bot.sendMessage(chatId, "✅ Channel-এ Post পাঠানো হয়েছে।");
  } catch (err) { await bot.sendMessage(chatId, "❌ Post Failed: " + err.message); }
});

// ======================================================
// AI HANDLER
// ======================================================

bot.on("message", async (msg) => {
  const chatId = msg.chat?.id;
  const text = typeof msg.text === "string" ? msg.text.trim() : "";
  if (!chatId || !text) return;
  if (text.startsWith("/")) return;
  if (!aiMode.has(chatId)) return;
  if (!openai) return bot.sendMessage(chatId, "🤖 AI unavailable.");
  if (busy.has(chatId)) return bot.sendMessage(chatId, "⏳ Please wait...");
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
    if (!answer) throw new Error("Empty");
    history.push({ role: "assistant", content: answer });
    userHistory.set(chatId, history.slice(-MAX_HISTORY));
    await sendLongMessage(chatId, answer);
  } catch (err) {
    console.error("AI error:", err?.message);
    await bot.sendMessage(chatId, "⚠️ AI response failed. Please try again.");
  } finally { busy.delete(chatId); }
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
      } catch (err) {
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
  console.log(`Webhook URL: ${WEBHOOK_URL}`);
  try {
    const me = await bot.getMe();
    console.log(`Bot authenticated: @${me.username || me.first_name}`);
    await bot.deleteWebHook();
    await bot.setWebHook(WEBHOOK_URL);
    const info = await bot.getWebHookInfo();
    console.log(`Webhook verified: ${info.url || "not set"}`);
    if (info.last_error_message) console.error(`Webhook error: ${info.last_error_message}`);
    else console.log("Webhook has no errors.");
  } catch (err) { console.error("WEBHOOK SETUP FAILED:", err?.message); }
}

// ======================================================
// START SERVER
// ======================================================

server.listen(PORT, async () => {
  console.log(`Bot listening on port ${PORT}`);
  await setupTelegramWebhook();
});
