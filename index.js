require('dotenv').config();
const { Client, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: ['Guilds', 'GuildMessages', 'MessageContent']
});

client.commands = new Collection();

const PREFIX = '!';

const komutlarPath = path.join(__dirname, 'komutlar');
const komutDosyalari = fs.readdirSync(komutlarPath).filter(file => file.endsWith('.js'));

for (const dosya of komutDosyalari) {
  const dosyaYolu = path.join(komutlarPath, dosya);
  const komut = require(dosyaYolu);

  if ('name' in komut) {
    client.commands.set(komut.name, komut);
    
    if (komut.aliases && Array.isArray(komut.aliases)) {
      komut.aliases.forEach(alias => {
        client.commands.set(alias, komut);
      });
    }
  }
}

client.once('ready', () => {
  console.log(`${client.user.tag} olarak giriş yapıldı!`);
  client.user.setActivity('KuramaMC On The Top!', { type: 'PLAYING' });
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const komutAdi = args.shift().toLowerCase();

  const komut = client.commands.get(komutAdi);

  if (!komut) return;

  try {
    if (komut.name === 'ping') {
      await komut.execute(message, client);
    } else {
      await komut.execute(message);
    }
  } catch (error) {
    console.error(error);
    message.reply('Komut çalışırken bir hata oldu reis!');
  }
});

client.login(process.env.TOKEN);
