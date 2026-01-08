const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

const CONFETI_EMOJI = "🎉";

function parseTurkishTime(input) {
  const match = input.match(/^(\d+)(sn|d|s|h|a|y)$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const type = match[2];

  const map = {
    sn: 1000,
    d: 60 * 1000,
    s: 60 * 60 * 1000,
    h: 7 * 24 * 60 * 60 * 1000,
    a: 30 * 24 * 60 * 60 * 1000,
    y: 365 * 24 * 60 * 60 * 1000
  };

  return value * map[type];
}

function formatRemaining(ms) {
  let s = Math.floor(ms / 1000);

  const y = Math.floor(s / 31536000);
  s %= 31536000;
  const a = Math.floor(s / 2592000);
  s %= 2592000;
  const h = Math.floor(s / 604800);
  s %= 604800;
  const sa = Math.floor(s / 3600);
  s %= 3600;
  const d = Math.floor(s / 60);
  s %= 60;

  const parts = [];
  if (y) parts.push(`${y} yıl`);
  if (a) parts.push(`${a} ay`);
  if (h) parts.push(`${h} hafta`);
  if (sa) parts.push(`${sa} saat`);
  if (d) parts.push(`${d} dakika`);
  if (s) parts.push(`${s} saniye`);

  return parts.join(" ");
}

module.exports = {
  name: "çekiliş",
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ Bu komutu sadece adminler kullanabilir.");
    }

    if (args.length < 2) {
      return message.reply("❌ Kullanım: `!çekiliş <ödül> <süre>`");
    }

    const timeInput = args.pop();
    const prize = args.join(" ");
    const duration = parseTurkishTime(timeInput);

    if (!duration) {
      return message.reply("❌ Süre formatı hatalı.");
    }

    await message.delete();

    const participants = new Set();
    const endTime = Date.now() + duration;

    const button = new ButtonBuilder()
      .setCustomId("giveaway_join")
      .setLabel("Çekilişe Katıl")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    const embed = new EmbedBuilder()
      .setColor(Math.floor(Math.random() * 16777215))
      .setTitle(`${CONFETI_EMOJI} Çekiliş Başladı! ${CONFETI_EMOJI}`)
      .setDescription(
`${CONFETI_EMOJI} Çekiliş Başladı Hemen Katılmak İçin Butona Tıklayın!

Ödül: **${prize}**
Yetkili: ${message.author}
Katılan Sayısı: **0**
Kalan Süre: **${formatRemaining(duration)}**`
      )
      .setFooter({
        text: "kuramamc.tkmc.net | KuramaMC",
        iconURL: message.guild.iconURL({ dynamic: true })
      });

    const giveawayMessage = await message.channel.send({
      embeds: [embed],
      components: [row]
    });

    const collector = giveawayMessage.createMessageComponentCollector({
      time: duration
    });

    collector.on("collect", async (interaction) => {
      if (participants.has(interaction.user.id)) {
        return interaction.reply({ content: "❌ Zaten katıldın.", ephemeral: true });
      }

      participants.add(interaction.user.id);
      await interaction.reply({ content: "✅ Çekilişe katıldın!", ephemeral: true });
    });

    const interval = setInterval(async () => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) return;

      embed.setDescription(
`${CONFETI_EMOJI} Çekiliş Başladı Hemen Katılmak İçin Butona Tıklayın!

Ödül: **${prize}**
Yetkili: ${message.author}
Katılan Sayısı: **${participants.size}**
Kalan Süre: **${formatRemaining(remaining)}**`
      );

      await giveawayMessage.edit({ embeds: [embed] });
    }, 1000);

    collector.on("end", async () => {
      clearInterval(interval);

      if (participants.size === 0) {
        return message.channel.send(`${CONFETI_EMOJI} Katılım olmadı.`);
      }

      const winner = [...participants][
        Math.floor(Math.random() * participants.size)
      ];

      message.channel.send(
        `${CONFETI_EMOJI} Çekilişin Kazananı: <@${winner}>`
      );
    });
  }
};
