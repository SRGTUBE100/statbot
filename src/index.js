const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Process error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    console.error(error.stack);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    if (error.stack) console.error(error.stack);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Performing graceful shutdown...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Performing graceful shutdown...');
    process.exit(0);
});

// Get environment variables from Railway
const TOKEN = process.env.DISCORD_TOKEN;

if (!TOKEN) {
    console.error('Missing DISCORD_TOKEN! Make sure it is set in Railway variables.');
    process.exit(1);
}

// Print startup message
console.log('='.repeat(50));
console.log('Bot process starting...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Node version:', process.version);
console.log('Discord.js version:', require('discord.js').version);
console.log('Process ID:', process.pid);
console.log('='.repeat(50));

// Initialize client with all necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Collections for commands and cooldowns
client.commands = new Collection();
client.cooldowns = new Collection();

console.log('Starting bot initialization...');

// Load commands
const commandsPath = path.join(__dirname, 'commands');
console.log(`Loading commands from: ${commandsPath}`);

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
console.log(`Found ${commandFiles.length} command files`);

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`Loaded command: ${command.data.name}`);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    } catch (error) {
        console.error(`Error loading command ${file}:`, error);
    }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
console.log(`Loading events from: ${eventsPath}`);

const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
console.log(`Found ${eventFiles.length} event files`);

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`Loaded event: ${event.name}`);
    } catch (error) {
        console.error(`Error loading event ${file}:`, error);
    }
}

// Handle slash commands
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// Error handling
client.on('error', error => {
    console.error('Discord client error:', error);
});

// Add debug events
client.on('debug', info => {
    console.log('Debug:', info);
});

client.on('warn', info => {
    console.log('Warning:', info);
});

// Health check interval
setInterval(() => {
    console.log(`[Health Check] Bot is running. Connected to ${client.guilds.cache.size} servers.`);
    console.log(`[Health Check] Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
}, 60000); // Log every minute

// Login with error handling and timeout
console.log('Attempting to log in...');
const loginTimeout = setTimeout(() => {
    console.error('Login attempt timed out after 30 seconds');
    process.exit(1);
}, 30000);

client.login(TOKEN)
    .then(() => {
        clearTimeout(loginTimeout);
        console.log('Successfully logged in!');
    })
    .catch(error => {
        clearTimeout(loginTimeout);
        console.error('Failed to login:', error);
        process.exit(1);
    }); 
