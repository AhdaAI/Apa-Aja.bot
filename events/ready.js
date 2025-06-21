const { Events } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`[✓] ${client.user.tag} is online and ready!`);

    if (process.env.NODE_ENV === "production") {
      console.log("\n=============== ENVIRONMENT: PRODUCTION ===============");
    } else {
      console.log("\n============== ENVIRONMENT: DEVELOPMENT ===============");
    }
    console.log("----- Bot is ready to receive commands and events. ----");
    console.log("=======================================================");
  },
};
