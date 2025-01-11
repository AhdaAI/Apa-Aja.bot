const fs = require("node:fs");
const path = require("node:path");
const { accessSecret } = require("./secret_manager");
const { fprint } = require("./utils/basic")

const {
  Client,
  GatewayIntentBits,
  ActivityType,
  Collection,
} = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  presence: [
    { activities: [{ name: "Your Balls.", type: ActivityType.Playing }] },
  ],
});

client.dev = new Collection();
client.dev = process.argv[2] === "dev" ? true : false;

(async () => {
  const token = client.dev
    ? process.env.DISCORD_DEV_BOT
    : await accessSecret("Discord_Bot");

  if (!token) {
    console.log("Token not found.");
    console.log("Please check GCP Credentials.");
    process.exit(1)
  }

  client.commands = new Collection();
  const folderPath = path.join(__dirname, "/src/commands");
  const commandFiles = fs
    .readdirSync(folderPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }

  const eventsPath = path.join(__dirname, "/src/events");
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  try{
    await client.login(token);
  } catch (e) {
    console.error("[ Client ] Client Error: ", e)
    console.log(token)
    process.exit(1)
  }
})();
