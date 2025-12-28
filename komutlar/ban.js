const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Üyeyi sunucudan banlar.',
    usage: '!ban @kullanıcı [sebep]',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) 
            return message.reply('Bu komutu kullanmak için yeterli yetkin yok!');

        const user = message.mentions.members.first();
        const reason = args.slice(1).join(' ') || 'Sebep belirtilmedi';

        if (!user) return message.reply('Lütfen banlamak istediğin kullanıcıyı etiketle.');
        if (!user.bannable) return message.reply('Bu kullanıcıyı yasaklayamazsın!');

        await user.ban({ reason });

        const date = new Date();
        const banDate = date.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('Oyuncu Yasaklandı! ✈️')
            .setDescription(`${user.user.tag} adlı üye sunucudan yasaklandı.\n\n**Yasaklayan Yetkili:** ${message.author}\n**Yasaklanma Tarihi:** ${banDate}`)
            .setFooter({ text: 'kuramamc.tkmc.net | KuramaMC' });

        message.channel.send({ embeds: [embed] });
    }
};
