const { Events, Client, REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const commands = [];
const folderPath = path.join(__dirname, "../commands");
const commandFiles = fs
  .readdirSync(folderPath)
  .filter((file) => file.endsWith(".js"));

module.exports = {
  name: Events.ClientReady,
  once: true,

  /**
   *
   * @param {Client} client
   */
  execute(client) {
    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);
      if ("data" in command && "execute" in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(
          "WARNING",
          `The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    }

    (async () => {
      const clientId = process.env.CLIENT_ID;
      const rest = new REST().setToken(client.token);

      try {
        console.log(
          `Started refreshing ${commands.length} application (/) commands.`
        );

        if (client.dev) {
          const guildId = process.env.GUILD_ID;
          const guildData = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            {
              body: commands,
            }
          );

          console.log(
            "GUILD",
            `Successfully reloaded ${guildData.length} application (/) commands.`
          );

          return commands;
        } else {
          const globalData = await rest.put(
            Routes.applicationCommands(clientId),
            {
              body: commands,
            }
          );

          console.log(
            "GLOBAL",
            `Successfully reloaded ${globalData.length} application (/) commands.`
          );

          return commands;
        }
      } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
      }
    })();
    console.log("READY", `Logged in as '${client.user.username}'`);
  },
};
