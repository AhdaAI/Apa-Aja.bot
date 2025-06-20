const FS = require("fs");
const PATH = require("path");
const DISCORD = require("discord.js");
const { Client, GatewayIntentBits } = DISCORD;
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
const { getSecret } = require("./GCP/secret_manager");

// Load environment variables
console.log("[ ] Checking .env file...");
let envFilePath = PATH.join(__dirname, ".env");
if (!FS.existsSync(envFilePath)) {
  console.error("[?] .env file not found. Assuming production environment.");
  console.log("[!] Using .env.production as fallback.");
  envFilePath = PATH.join(__dirname, ".env.production");
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
