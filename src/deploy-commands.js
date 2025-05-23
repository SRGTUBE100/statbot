const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// Get environment variables from Railway
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
    console.error('Missing required environment variables! Make sure DISCORD_TOKEN and CLIENT_ID are set in Railway variables.');
    process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const rest = new REST().setToken(TOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands globally.`);

        // The put method is used to fully refresh all commands globally
        const data = await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands globally.`);
    } catch (error) {
        // Log the detailed error
        console.error('Error during command registration:');
        if (error.code) {
            console.error(`Error Code: ${error.code}`);
        }
        if (error.message) {
            console.error(`Error Message: ${error.message}`);
        }
        console.error(error);
    }
})(); 
