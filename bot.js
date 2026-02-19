require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');

// Check required environment variables
if (!process.env.BOT_TOKEN || !process.env.WEATHER_KEY) {
  console.error('❌ Missing BOT_TOKEN or WEATHER_KEY in environment variables');
  process.exit(1);
}

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEATHER_KEY = process.env.WEATHER_KEY;

const bot = new Telegraf(BOT_TOKEN);

// Handle /start command
bot.start((ctx) => {
  ctx.reply(
    '🌤️ Welcome!\n\nSend me your location and I will show you the current weather.',
    {
      reply_markup: {
        keyboard: [[{ text: '📍 Share location', request_location: true }]],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    }
  );
});

// Handle messages with location
bot.on('message', async (ctx) => {
  if (!ctx.message.location) {
    return ctx.reply('📍 Please send your location.');
  }

  const { latitude, longitude } = ctx.message.location;

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_KEY}`;
    const { data } = await axios.get(url);

    ctx.reply(
      `🌍 Weather in ${data.name}:\n` +
      `🌡️ Temperature: ${data.main.temp}°C\n` +
      `🤔 Feels like: ${data.main.feels_like}°C\n` +
      `🌤️ Condition: ${data.weather[0].description}`
    );
  } catch (err) {
    console.error(err.response?.data || err.message);
    ctx.reply('⚠️ Failed to fetch weather. Try again later.');
  }
});

// === Deployment settings ===
const PORT = process.env.PORT || 3000;
const WEBHOOK_DOMAIN = process.env.RAILWAY_STATIC_URL;

// Use webhook in production, polling locally
if (WEBHOOK_DOMAIN) {
  bot.launch({
    webhook: {
      domain: WEBHOOK_DOMAIN,
      port: PORT
    }
  });
  console.log(`🚀 Bot running on Railway webhook at ${WEBHOOK_DOMAIN}:${PORT}`);
} else {
  bot.launch();
  console.log('🚀 Bot running locally using polling...');
}

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
