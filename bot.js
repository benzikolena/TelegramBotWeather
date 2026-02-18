require('dotenv').config();

const { Telegraf } = require('telegraf');
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);
const WEATHER_KEY = process.env.WEATHER_KEY;

console.log('BOT_TOKEN:', process.env.BOT_TOKEN ? 'SET' : 'MISSING');
console.log('WEATHER_KEY:', process.env.WEATHER_KEY ? 'SET' : 'MISSING');

if (!process.env.BOT_TOKEN || !process.env.WEATHER_KEY) {
  console.error('❌ Missing required environment variables!');
  process.exit(1);
}


bot.start((ctx) => {
  ctx.reply(
    '🌤️ Welcome!\n\nSend me your location and I will show you the current weather.',
    {
      reply_markup: {
        keyboard: [
          [{ text: '📍 Share location', request_location: true }]
        ],
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

    const temp = data.main.temp;
    const feelsLike = data.main.feels_like;
    const desc = data.weather[0].description;
    const city = data.name;

   ctx.reply(
    `🌍 Weather in ${city}:\n` +
    `🌡️ Temperature: ${temp}°C\n` +
    `🤔 Feels like: ${feelsLike}°C\n` +
    `🌤️ Condition: ${desc}`
    );

  } catch (err) {
    console.error(err.response?.data || err.message);
    ctx.reply('⚠️ Failed to fetch weather. Try again later.');
  }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
