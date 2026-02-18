const { Telegraf } = require('telegraf');
const axios = require('axios');

if (!process.env.BOT_TOKEN || !process.env.WEATHER_KEY) {
  console.error('❌ Missing BOT_TOKEN or WEATHER_KEY in environment variables');
  process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);
const WEATHER_KEY = process.env.WEATHER_KEY;

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

const PORT = process.env.PORT || 3000;
const WEBHOOK_DOMAIN = process.env.RAILWAY_STATIC_URL || 'http://localhost:3000';

bot.launch({
  webhook: {
    domain: WEBHOOK_DOMAIN,
    port: PORT
  }
});

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
