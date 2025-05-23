const { Events, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log('Bot is starting up...');
        console.log(`Logged in as ${client.user.tag}`);
        console.log(`Bot ID: ${client.user.id}`);
        console.log(`Serving ${client.guilds.cache.size} servers`);
        
        try {
            client.user.setActivity('status updates | /help', { 
                type: ActivityType.Watching 
            });
            console.log('Successfully set activity status');
        } catch (error) {
            console.error('Error setting activity:', error);
        }
        
        console.log('Bot is now fully ready!');
    },
}; 
