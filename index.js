const { exit } = require("node:process");
const { loadEnv, registerEnv } = require("./utils/util");

if (!loadEnv()) {
  console.log("[?] [?] Failed to load environment variable. [?] [?]");
  console.log("Please check your existing environment file.");
  exit(1);
}

const fs = require("node:fs");
const path = require("node:path");

const {
  Client,
  GatewayIntentBits,
  ActivityType,
  Collection,
} = require("discord.js");
const { log } = require("node:console");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  presence: [
    { activities: [{ name: "Your Balls.", type: ActivityType.Playing }] },
  ],
});

client.dev = new Collection();
client.dev = process.argv[2] === "dev" ? true : false;

client.commands = new Collection();
const folderPath = path.join(__dirname, "/src/commands");
const commandFiles = fs
  .readdirSync(folderPath)
  .filter((file) => file.endsWith(".js"));

log(`# Found ${commandFiles.length} commands.`);
for (const file of commandFiles) {
  const filePath = path.join(folderPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

const eventsPath = path.join(__dirname, "/src/events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

log(`# Found ${eventFiles.length} events.`);
for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

(async () => {
  /**
   * Below need to be an async function
   */
  if (process.argv[2] !== "dev") {
    const { accessSecret } = require("./secret_manager");

    const [_TOKEN, _CLIENT] = await Promise.all([
      accessSecret("Discord_Bot"),
      accessSecret("Discord_Client_Id"),
    ]);
    registerEnv("TOKEN", _TOKEN);
    registerEnv("CLIENT_ID", _CLIENT);
  } else {
    log("==== Developer mode ====");
  }

  await client.login(process.env.TOKEN);
})();
