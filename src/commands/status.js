const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Shows server and member status information'),
    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const guild = interaction.guild;
            const totalMembers = guild.memberCount;
            
            // Fetch all members to ensure we have the latest data
            await guild.members.fetch();
            const onlineMembers = guild.members.cache.filter(member => 
                member.presence?.status === 'online' || 
                member.presence?.status === 'idle' || 
                member.presence?.status === 'dnd'
            ).size;
            
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

            await interaction.editReply({ embeds: [statusEmbed] });
        } catch (error) {
            console.error('Error in status command:', error);
            await interaction.editReply({ content: 'An error occurred while fetching server status.', ephemeral: true });
        }
    },
}; 
