const { PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    name: "kilitle",
    description: "Belirtilen kanalı yazı yazmaya kapatır.",
    usage: "!kilitle #kanal",
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) 
            return message.reply("Bu komutu kullanmak için yeterli yetkin yok. ❌");

        const channel = message.mentions.channels.first() || message.channel;

        try {
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });

            const randomColor = Math.floor(Math.random() * 16777215).toString(16);

            const embed = new EmbedBuilder()
                .setColor(`#${randomColor}`)
                .setTitle("🔒 Kanal Başarıyla Kilitlendi")
                .setDescription(`${channel} <@${message.member.id}> adlı yetkili tarafından kilitlendi.\nKanal artık yazmaya kapalı, üyeler mesaj gönderemez.`)
                .setFooter({ text: "kuramamc.tkmc.net | KuramaMC" })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (err) {
            message.reply("Kanal Kilitlenirken Bir Hata Oluştu.");
            console.error(err);
        }
    },
};
