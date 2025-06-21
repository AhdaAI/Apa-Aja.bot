const FS = require("fs");
const PATH = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
const { loadEnv } = require("./utility/env");

loadEnv();

// ----- Command Collection -----
client.commands = new Collection();
const commandFiles = FS.readdirSync(PATH.join(__dirname, "commands")).filter(
  (file) => file.endsWith(".js")
);
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`[✓] Command ${command.data.name} loaded successfully.`);
  } else {
    console.warn(`[!] Command ${file} is missing required properties.`);
  }
}

// ----- Event Handling -----
const eventFiles = FS.readdirSync(PATH.join(__dirname, "events")).filter(
  (file) => file.endsWith(".js")
);
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.name && event.execute) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    console.log(`[✓] Event ${event.name} loaded successfully.`);
  } else {
    console.warn(`[!] Event ${file} is missing required properties.`);
  }
}

client.login(process.env.DISCORD_TOKEN);
