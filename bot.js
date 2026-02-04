require('dotenv').config();

const { Telegraf } = require('telegraf');
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);
const WEATHER_KEY = process.env.WEATHER_KEY;

bot.start((ctx) => ctx.reply('Send me your location and I’ll tell you the weather 🌤️'));

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
