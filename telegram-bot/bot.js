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

// /start
bot.onText(/^\/start$/, async (msg) => {
  try {
    await bot.sendMessage(
      msg.chat.id,
      "🎨 Welcome to Pixora!\n\nPixora Telegram Bot is online."
    );
  } catch (error) {
    console.error("Start command error:", error.message);
  }
});

// /help
bot.onText(/^\/help$/, async (msg) => {
  try {
    await bot.sendMessage(
      msg.chat.id,
      "Pixora Bot Commands:\n\n/start - Start Pixora\n/help - Show help"
    );
  } catch (error) {
    console.error("Help command error:", error.message);
  }
});

// Normal messages
bot.on("message", async (msg) => {
  if (!msg.text || msg.text.startsWith("/")) return;

  try {
    await bot.sendMessage(
      msg.chat.id,
      "🤖 Pixora Bot is online.\nUse /help to see available commands."
    );
  } catch (error) {
    console.error("Message error:", error.message);
  }
});

// HTTP server required by Render Web Service
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

server.listen(PORT, async () => {
  console.log(`Pixora Telegram Bot listening on port ${PORT}`);

  const webhookUrl = `${RENDER_URL}/telegram-webhook`;

  try {
    await bot.setWebHook(webhookUrl);
    console.log(`Telegram webhook set successfully: ${webhookUrl}`);
  } catch (error) {
    console.error("Webhook setup error:", error.message);
  }
});
