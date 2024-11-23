require("dotenv").config();
const { accessSecret } = require("./secret_manager");

const { Client, GatewayIntentBits, ActivityType } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  presence: [
    { activities: [{ name: "Your Balls.", type: ActivityType.Playing }] },
  ],
});

(async () => {
  const token = await accessSecret("Discord_Dev_Bot");

  client.login(token);
})();
