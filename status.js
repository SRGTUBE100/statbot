const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Shows server and member status information'),
    async execute(interaction) {
        const guild = interaction.guild;
        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(member => member.presence?.status === 'online').size;
        
        const statusEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('📊 Server Status')
            .setDescription('Real-time server statistics and information')
            .addFields(
                { name: '👥 Total Members', value: `${totalMembers}`, inline: true },
                { name: '🟢 Online Members', value: `${onlineMembers}`, inline: true },
                { name: '🏷️ Server Name', value: guild.name, inline: true },
                { name: '📅 Server Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Enhanced Status Bot', iconURL: interaction.client.user.displayAvatarURL() });

        await interaction.reply({ embeds: [statusEmbed] });
    },
}; 
