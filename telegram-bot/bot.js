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
// MAIN MENU (বাংলা লেবেল)
// ======================================================

function mainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🎁 স্পেশাল অফার", url: getRandomAdLink() }],
        [{ text: "💰 ইনকামের তথ্য", callback_data: "earn_info" }],
        [
          { text: "📊 ব্যালেন্স চেক", callback_data: "balance" },
          { text: "💸 উইথড্র", callback_data: "withdraw" }
        ],
        [
          { text: "📺 YouTube", url: YOUTUBE_URL },
          { text: "📘 Facebook", url: FACEBOOK_URL }
        ],
        [
          { text: "🎵 TikTok", url: TIKTOK_URL },
          { text: "✈️ Telegram", url: TELEGRAM_CHANNEL }
        ],
        [{ text: "👥 গ্রুপে যোগ দিন", url: TELEGRAM_GROUP }],
        [
          { text: "🆘 সাপোর্ট", callback_data: "support" },
          { text: "❓ হেল্প", callback_data: "help" }
        ],
        [{ text: "🌐 অ্যাপ ওপেন করুন", url: APP_URL }]
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
        [{ text: "🎁 স্পেশাল অফার", url: getRandomAdLink() }],
        [{ text: "🌐 অ্যাপ ওপেন করুন", url: APP_URL }],
        [{ text: "⬅️ মেইন মেনু", callback_data: "back" }]
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
            [{ text: "🎁 স্পেশাল অফার", url: getRandomAdLink() }],
            [{ text: "🌐 অ্যাপ ওপেন করুন", url: APP_URL }],
            [{ text: "👥 গ্রুপে যোগ দিন", url: TELEGRAM_GROUP }]
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
      `🎉 স্বাগতম ${userName}!

🎯 *Atik Daily Earning*-এ স্বাগতম!

💰 *আমাদের সার্ভিস:*
📺 Watch Ads — ৳0.10
📅 Daily Job — ৳0.20
🧮 Math Earn — ৳0.04
🛒 Social Promote — বিভিন্ন প্রাইস

🌐 *Website:*
${APP_URL}

👇 শুরু করতে নিচের বাটনে ক্লিক করুন 👇`,
      { parse_mode: "Markdown", ...mainMenu() }
    );
  } catch (err) {
    console.error("/start error:", err.message);
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
      `💰 *ইনকামের বিবরণ (Earning Details)*

📺 Watch Ads — ৳0.10/Ad
📅 Daily Job — ৳0.20/Job
🧮 Math Earn — ৳0.04/Math
🛒 Social Promote — Various Prices

🌐 App:
${APP_URL}`,
      { parse_mode: "Markdown", ...backMenu() }
    );
  } catch (err) { console.error("/earn error:", err.message); }
});

// ======================================================
// /BALANCE
// ======================================================

bot.onText(/^\/balance(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    await bot.sendMessage(
      chatId,
      `📊 *আপনার ব্যালেন্স চেক করুন*

💵 বর্তমান ব্যালেন্স: ৳ [ব্যালেন্স]
💰 মোট আয়: ৳ [মোট আয়]
📺 দেখা অ্যাড: [সংখ্যা]
🧮 ম্যাথ সলভ: [সংখ্যা]

🏧 উইথড্র করতে:
ন্যূনতম ৳2780 প্রয়োজন।

🌐 অ্যাপে যান:
${APP_URL}`,
      { parse_mode: "Markdown", ...backMenu() }
    );
  } catch (err) { console.error("/balance error:", err.message); }
});

// ======================================================
// /WITHDRAW
// ======================================================

bot.onText(/^\/withdraw(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    await bot.sendMessage(
      chatId,
      `💸 *উইথড্র রিকোয়েস্ট*

🏧 ন্যূনতম উইথড্র: ৳2780
💸 ফি: ৳40
📅 সময়: ৫ দিনে একবার

📱 পেমেন্ট মেথড:
✅ bKash
✅ Nagad

📌 কীভাবে উইথড্র করবেন:
১. ওয়েবসাইটে লগইন করুন।
২. উইথড্র পেজে যান।
৩. আপনার bKash/Nagad নম্বর দিন।
৪. অ্যামাউন্ট লিখে সাবমিট করুন।
৫. ২৪-৪৮ ঘণ্টার মধ্যে পেমেন্ট পাবেন।

🌐 উইথড্র করতে ক্লিক করুন:
${APP_URL}`,
      { parse_mode: "Markdown", ...backMenu() }
    );
  } catch (err) { console.error("/withdraw error:", err.message); }
});

// ======================================================
// /HELP
// ======================================================

bot.onText(/^\/help(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    await bot.sendMessage(
      chatId,
      `❓ *Help & Support*

📌 *কীভাবে অ্যাপ ব্যবহার করবেন:*
১. ওয়েবসাইটে যান এবং রেজিস্ট্রেশন করুন।
২. অ্যাড দেখুন এবং ম্যাথ সলভ করে আয় করুন।
৩. ব্যালেন্স ৳2780 হলে উইথড্র করুন।
৪. প্রতিদিন ২০টি অ্যাড এবং ২০টি ম্যাথ লিমিট।

📌 *সাধারণ সমস্যা:*
❌ লগইন না হলে → পাসওয়ার্ড রিসেট করুন।
❌ অ্যাড না এলে → ইন্টারনেট চেক করুন।
❌ উইথড্র না হলে → সাপোর্টে যোগাযোগ করুন।

📞 *সাপোর্ট:*
Telegram: t.me/atikbreand420

💡 আরও জানতে:
${APP_URL}`,
      { parse_mode: "Markdown", ...backMenu() }
    );
  } catch (err) { console.error("/help error:", err.message); }
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

🎯 Telegram: ${SUPPORT_CONTACT}
👥 Group: ${TELEGRAM_GROUP}
📢 Channel: ${TELEGRAM_CHANNEL}

২৪/৭ আমাদের সাথে যোগাযোগ করুন।`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🆘 সাপোর্ট", url: `https://t.me/${SUPPORT_CONTACT.replace("@", "")}` }],
            [{ text: "👥 গ্রুপে যোগ দিন", url: TELEGRAM_GROUP }]
          ]
        }
      }
    );
  } catch (err) { console.error("/contact error:", err.message); }
});

// ======================================================
// /AI
// ======================================================

bot.onText(/^\/ai(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;
  if (!openai) {
    return bot.sendMessage(chatId, "🤖 AI Assistant এখন কাজ করছে না।");
  }
  aiMode.add(chatId);
  userHistory.set(chatId, []);
  await bot.sendMessage(
    chatId,
    `🤖 *AI Assistant চালু হয়েছে!*

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
  await bot.sendMessage(chatId, "🛑 AI mode বন্ধ হয়েছে।", mainMenu());
});

// ======================================================
// /POST (Admin)
// ======================================================

bot.onText(/^\/post(?:@\w+)?$/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  if (userId !== 8819013561) {
    return bot.sendMessage(chatId, "❌ আপনি Admin না।");
  }
  try {
    await postToChannel();
    await bot.sendMessage(chatId, "✅ Channel-এ Post পাঠানো হয়েছে।");
  } catch (err) {
    await bot.sendMessage(chatId, "❌ Post Failed: " + err.message);
  }
});

// ======================================================
// CALLBACK BUTTONS (বাংলা মেসেজ)
// ======================================================

bot.on("callback_query", async (query) => {
  const chatId = query.message?.chat?.id;
  const data = query.data;
  if (!chatId) return;
  try { await bot.answerCallbackQuery(query.id); } catch (e) {}

  try {
    if (data === "earn_info") {
      return bot.sendMessage(
        chatId,
        `💰 *ইনকামের বিবরণ (Earning Details)*

📺 Watch Ads — ৳0.10/Ad
📅 Daily Job — ৳0.20/Job
🧮 Math Earn — ৳0.04/Math
🛒 Social Promote — Various Prices

🌐 App: ${APP_URL}`,
        { parse_mode: "Markdown", ...backMenu() }
      );
    }

    if (data === "balance") {
      return bot.sendMessage(
        chatId,
        `📊 *আপনার ব্যালেন্স চেক করুন*

💵 বর্তমান ব্যালেন্স: ৳ [ব্যালেন্স]
💰 মোট আয়: ৳ [মোট আয়]
📺 দেখা অ্যাড: [সংখ্যা]
🧮 ম্যাথ সলভ: [সংখ্যা]

🏧 উইথড্র করতে:
ন্যূনতম ৳2780 প্রয়োজন।

🌐 অ্যাপে যান:
${APP_URL}`,
        { parse_mode: "Markdown", ...backMenu() }
      );
    }

    if (data === "withdraw") {
      return bot.sendMessage(
        chatId,
        `💸 *উইথড্র রিকোয়েস্ট*

🏧 ন্যূনতম উইথড্র: ৳2780
💸 ফি: ৳40
📅 সময়: ৫ দিনে একবার

📱 পেমেন্ট মেথড:
✅ bKash
✅ Nagad

🌐 উইথড্র করতে ক্লিক করুন:
${APP_URL}`,
        { parse_mode: "Markdown", ...backMenu() }
      );
    }

    if (data === "support") {
      return bot.sendMessage(
        chatId,
        `🆘 *Support Center*

🎯 Telegram: ${SUPPORT_CONTACT}
👥 Group: Join করুন
📢 Channel: Subscribe করুন

২৪/৭ সাপোর্ট।`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🆘 সাপোর্ট", url: `https://t.me/${SUPPORT_CONTACT.replace("@", "")}` }],
              [{ text: "👥 গ্রুপে যোগ দিন", url: TELEGRAM_GROUP }],
              [{ text: "⬅️ ফিরে যান", callback_data: "back" }]
            ]
          }
        }
      );
    }

    if (data === "help") {
      return bot.sendMessage(
        chatId,
        `❓ *Help & Support*

📌 *কীভাবে অ্যাপ ব্যবহার করবেন:*
১. ওয়েবসাইটে রেজিস্ট্রেশন করুন।
২. অ্যাড দেখুন এবং ম্যাথ সলভ করে আয় করুন।
৩. ব্যালেন্স ৳2780 হলে উইথড্র করুন।

📞 *সাপোর্ট:* t.me/atikbreand420

🌐 ${APP_URL}`,
        { parse_mode: "Markdown", ...backMenu() }
      );
    }

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

🎯 *Atik Daily Earning*-এ স্বাগতম

💰 আয়ের সুযোগ:
📺 Watch Ads — ৳0.10
📅 Daily Job — ৳0.20
🧮 Math Earn — ৳0.04

🌐 App: ${APP_URL}`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "🎁 স্পেশাল অফার", url: getRandomAdLink() }],
              [{ text: "🌐 অ্যাপ ওপেন করুন", url: APP_URL }],
              [{ text: "✈️ চ্যানেলে যোগ দিন", url: TELEGRAM_CHANNEL }]
            ]
          }
        }
      );
    }
  } catch (err) { console.error("Welcome error:", err.message); }
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
  } catch (err) {
    console.error("WEBHOOK SETUP FAILED:", err?.message);
  }
}

// ======================================================
// START SERVER
// ======================================================

server.listen(PORT, async () => {
  console.log(`Bot listening on port ${PORT}`);
  await setupTelegramWebhook();
});
