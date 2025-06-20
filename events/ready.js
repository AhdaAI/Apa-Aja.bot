const { Events } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    if (process.env.NODE_ENV === "production") {
      console.log("===== Running in production environment. =====");
    } else {
      console.log("===== Running in development environment. =====");
    }
    console.log(`[ ] ${client.user.tag} is online and ready!`);
    console.log("[ ] Bot is ready to receive commands and events.");
  },
};
