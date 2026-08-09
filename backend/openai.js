const { OpenAI } = require('openai');
require('dotenv').config({ path: '../.env' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

module.exports = openai;
