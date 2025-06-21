const FS = require("fs");
const PATH = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
const { getSecret } = require("./GCP/secret_manager");
let envFileName;

if (process.env.NODE_ENV === "production") {
  console.log("===== Running in production environment. =====");
  envFileName = ".env.production";
} else {
  console.log("===== Running in development environment. =====");
  envFileName = ".env.development";
}

// Load environment variables
console.log("[ ] Checking environment variable...");
let envFilePath = PATH.join(__dirname, envFileName);
if (!FS.existsSync(envFilePath)) {
  console.error(
    `[!] Environment file ${envFileName} not found at ${envFilePath}`
  );
  console.log(
    "[?] Please create the file with the required environment variables."
  );
  process.exit(1);
}

try {
  const envFile = FS.readFileSync(envFilePath, "utf8");
  const envLines = envFile.split("\n");
  envLines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, value] = trimmedLine.split("=");
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
  console.log("[ ] Environment variable loaded successfully.");
} catch (error) {
  console.error(`[?] Error reading .env.* file: ${error.message}`);
  process.exit(1);
}

// Check for google cloud credentials
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "[!] GOOGLE_APPLICATION_CREDENTIALS environment variable is not set."
  );
  process.exit(1);
}

// Check for google cloud file existence
const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!FS.existsSync(path)) {
  console.error(`[!] Google Cloud credentials file not found at ${path}`);
  process.exit(1);
}

// Check for local token in .env file
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
        "[ ] Token fetched successfully from Google Cloud Secret Manager."
      );
    } catch (error) {
      console.error(`[!] Failed to fetch token: ${error.message}`);
      process.exit(1);
    }
  })();
}

// Command collection
client.commands = new Collection();
const commandFiles = FS.readdirSync(PATH.join(__dirname, "commands")).filter(
  (file) => file.endsWith(".js")
);
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
    console.log(`[ ] Command ${command.data.name} loaded successfully.`);
  } else {
    console.warn(`[!] Command ${file} is missing required properties.`);
  }
}

// Event handling
const eventFiles = FS.readdirSync(PATH.join(__dirname, "events")).filter(
  (file) => file.endsWith(".js")
);
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.name && event.execute) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
      console.log(`[ ] Event ${event.name} loaded successfully (once).`);
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
      console.log(`[ ] Event ${event.name} loaded successfully.`);
    }
  } else {
    console.warn(`[!] Event ${file} is missing required properties.`);
  }
}

client.login(process.env.DISCORD_TOKEN);
