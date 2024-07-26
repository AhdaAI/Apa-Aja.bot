require("dotenv").config();

const { Client, GatewayIntentBits, ActivityType } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  presence: [
    { activities: [{ name: "Your Balls.", type: ActivityType.Playing }] },
  ],
});

client.login(process.env.Token);
