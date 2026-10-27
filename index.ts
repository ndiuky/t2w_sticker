import { Client, MessageMedia, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal'
import { Bot } from "gramio";
import "dotenv/config";

// setup wa
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "/app/.wwebjs_auth",
    clientId: "sticker-most",
  }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});
client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('wa is ready!');
});

// setup telegram
const token = Bun.env["BOT_TOKEN"];
const phone = Bun.env["PHONE_NUMBER"];

if (!token || !phone) throw new Error(".env not valid");

const bot = new Bot(token);
bot.onStart(() => console.log("tg is ready!"));

bot.on("message", async (ctx) => {
  if (!ctx.sticker) return;

  const stickerId = ctx.sticker.fileId;

  let extension: string;

  if (ctx.sticker.isVideo()) { extension = "webm" }
  else if (ctx.sticker.isAnimated()) { extension = "tgs" }
  else { extension = "webp" }

  const stickerPath = `./tmp/${stickerId}.${extension}`;

  await bot.downloadFile(stickerId, stickerPath);

  const media = MessageMedia.fromFilePath(stickerPath);

  await client.sendMessage(`${phone.replace("+", "")}@c.us`, media, {
    sendMediaAsSticker: true,
    stickerName: "Telegram sticker",
    stickerAuthor: "Telegram",
  });
});

// run
const start = () => {
  client.initialize();
  bot.start();
}

void start();

let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} shutting down`);

  try {
    await client.destroy();
    await bot.stop();
  } catch (error) {
    console.error(error);
  }

  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
