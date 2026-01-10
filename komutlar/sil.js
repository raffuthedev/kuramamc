const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'sil',
  async execute(message, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return message.reply('❌ Bu komutu kullanmak için **Mesajları Yönet** yetkin olminus.');
    }

    const args = message.content.split(' ').slice(1);
    const amount = parseInt(args[0]);

    if (!amount || amount < 1 || amount > 300) {
      return message.reply('En Fazla **300** Mesaj Silebilirsiniz..');
    }

    try {
      const silinen = await message.channel.bulkDelete(amount, true);

      const embed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(`🧹 **${silinen.size} mesaj başarıyla silindi.**`)
        .setFooter({
          text: '5.133.100.199 | KuramaMC'
        });

      const bilgi = await message.channel.send({ embeds: [embed] });

      setTimeout(() => {
        bilgi.delete().catch(() => {});
      }, 3000);

    } catch (err) {
      console.error(err);
      message.reply('❌ Mesajlar silinirken bir hata oluştu.');
    }
  }
};
