const FS = require("fs");
const PATH = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
const { getSecret } = require("./GCP/secret_manager");
const { loadEnv } = require("./utility/env");

loadEnv();

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "[!] GOOGLE_APPLICATION_CREDENTIALS environment variable is not set."
  );
  process.exit(1);
}

const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!FS.existsSync(path)) {
  console.error(`[!] Google Cloud credentials file not found at ${path}`);
  process.exit(1);
}

// ----- Discord Token Check -----
if (!process.env.DISCORD_TOKEN) {
  console.error("[!] DISCORD_TOKEN environment variable is not set.");
  console.log(
    "[?] Attempting to fetch token from Google Cloud Secret Manager..."
  );
  (async () => {
    try {
      const secretName = "DISCORD_TOKEN";
      const token = await getSecret(secretName);
      process.env.DISCORD_TOKEN = token;
      console.log(
        "[✓] Token fetched successfully from Google Cloud Secret Manager."
      );
    } catch (error) {
      console.error(`[!] Failed to fetch token: ${error.message}`);
      process.exit(1);
    }
  })();
}

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
