const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function getAIResponse(message) {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: message,
      max_tokens: 100,
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error(error);
    return 'AI reply එක ලබා ගැනීමට අපොහොසත් විය.';
  }
}

async function startBot() {
  const sock = makeWASocket({
    auth: state,
  });

  sock.ev.on('messages.upsert', async (m) => {
    const message = m.messages[0];
    if (!message.message || message.key.fromMe) return;

    const text = message.message.conversation || message.message.extendedTextMessage?.text;

    if (text) {
      console.log(`Received: ${text}`);
      const reply = await getAIResponse(text);
      await sock.sendMessage(message.key.remoteJid, { text: reply });
    }
  });

  sock.ev.on('creds.update', saveState);
}

startBot();
