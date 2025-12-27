require('dotenv').config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("KuramaMC Discord Bot Aktif");
});

app.listen(PORT, () => {
  console.log(`Web server açık: ${PORT}`);
});

const {
  Client,
  Collection,
  EmbedBuilder,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require('discord.js');

const fs = require('fs');
const path = require('path');

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();
const PREFIX = '!';

const komutlarPath = path.join(__dirname, 'komutlar');
const komutDosyalari = fs.readdirSync(komutlarPath).filter(f => f.endsWith('.js'));

for (const dosya of komutDosyalari) {
  const komut = require(path.join(komutlarPath, dosya));
  if (!komut.name) continue;
  client.commands.set(komut.name, komut);
}

const eventlerPath = path.join(__dirname, 'eventler');
const eventlerDosyalari = fs.readdirSync(eventlerPath).filter(f => f.endsWith('.js'));

for (const dosya of eventlerDosyalari) {
  const event = require(path.join(eventlerPath, dosya));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

client.once(Events.ClientReady, () => {
  console.log(`${client.user.tag} olarak giriş yapıldı!`);
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const komutAdi = args.shift().toLowerCase();
  const komut = client.commands.get(komutAdi);
  if (!komut) return;

  await komut.execute(message, client);
});

const BASVURU_LOG_KANAL = "1454533545396670747";
const ONAY_KANAL = "1454515007806115984";
const AI_CHAT_KANAL = "1454516320459690097";
const MEDYA_KANAL_ID = "1454515901054324779";

const sohbetHafiza = new Map();

client.on(Events.MessageCreate, async message => {
  if (message.author.bot) return;
  if (message.channel.id !== AI_CHAT_KANAL) return;

  const userId = message.author.id;

  if (!sohbetHafiza.has(userId)) {
    sohbetHafiza.set(userId, []);
  }

  const gecmis = sohbetHafiza.get(userId);
  gecmis.push({ role: "user", content: message.content });
  if (gecmis.length > 50) gecmis.shift();

  try {
    await message.channel.sendTyping();

    const prompt = [
      {
        role: "system",
        content: "Sen KuramaMC sunucusu için çalışan yardımcı bir yapay zekasın. Sunucu IP Adresi kuramamc.tkmc.net Sürümü 1.21.5 ve Sunucu Henüz Açılmadı Bunları Oyuncular Sorduğuna Söyle"
      },
      ...gecmis
    ]
      .map(m => `${m.role === "user" ? "Kullanıcı" : "Asistan"}: ${m.content}`)
      .join("\n");

    const result = await geminiModel.generateContent(prompt);
    const cevap = result.response.text().slice(0, 1900);

    gecmis.push({ role: "assistant", content: cevap });

    await message.reply(cevap);
  } catch (err) {
    console.error(err);
    message.reply("KuramaMC AI - Error 605");
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (message.channel.id === MEDYA_KANAL_ID) {
    if (message.attachments.size === 0) {
      await message.delete().catch(() => {});

      const embed = new EmbedBuilder()
        .setDescription("Bu kanala sadece **resim** gönderilebilir!")
        .setColor("Red");

      const uyarıMesaj = await message.channel.send({ embeds: [embed] });

      setTimeout(() => {
        uyarıMesaj.delete().catch(() => {});
      }, 5000);
    }
  }
});

client.login(process.env.TOKEN);
