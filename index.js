require("dotenv").config();
const { accessSecret } = require("./secret_manager");

const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const { registerCommands } = require("./src/Utils/util");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  presence: [
    { activities: [{ name: "Your Balls.", type: ActivityType.Playing }] },
  ],
});

(async () => {
  const token = await accessSecret("Discord_Dev_Bot");

  await registerCommands(token);
  client.login(token);
})();
