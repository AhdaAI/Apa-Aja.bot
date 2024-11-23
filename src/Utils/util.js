const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const { accessSecret } = require("../../secret_manager");

const commands = [];
const devCommands = [];
const folderPath = path.join(__dirname, "../commands");
const commandFiles = fs
  .readdirSync(folderPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(folderPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    if ("dev" in command) {
      devCommands.push(command.data.toJSON());
    } else {
      commands.push(command.data.toJSON());
    }
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

const registerCommands = async (token) => {
  const clientId = await accessSecret("Discord_Dev_Client_Id");
  const guildId = await accessSecret("Discord_Dev_Server");
  const rest = new REST().setToken(token);

  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: devCommands }
    );

    const globalData = await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log(
      `[ Global ] Successfully reloaded ${globalData.length} application (/) commands.`
    );

    console.log(
      `[ Dev ] Successfully reloaded ${data.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
};

module.exports = { registerCommands };
