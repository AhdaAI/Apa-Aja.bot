const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
const { loadEnv } = require("./utility/env");
const logger = require("./utility/logger")

loadEnv();

const commands = [];
const folderPath = path.join(__dirname, "commands");
if (!fs.existsSync(folderPath)) {
  logger.error(`Commands folder not found at ${folderPath}`);
  process.exit(1);
}

const commandFiles = fs
  .readdirSync(folderPath)
  .filter((file) => file.endsWith(".js"));
if (commandFiles.length === 0) {
  logger.error("No command files found in the commands folder.");
  process.exit(1);
}

for (const file of commandFiles) {
  const filePath = path.join(folderPath, file);
  const command = require(filePath);
  if (!command.data || !command.execute) {
    logger.error(`Command file ${file} is missing required properties.`);
    continue;
  }
  commands.push(command.data.toJSON());
}

// Construct and prepare the REST client
const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_TOKEN || ""
);

(async () => {
  // Register commands with Discord
  if (!process.env.CLIENT_ID) {
    logger.error("CLIENT_ID environment variable is not set.");
    process.exit(1);
  }

  try {
    logger.info("Attempting to delete all global commands...");
    // Sending an empty array to the global commands endpoint
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] } // Send an empty array
    );

    logger.info("Started refreshing application (/) commands.");

    if (process.env.NODE_ENV === "production") {
      logger.info("Deploying commands to production environment...");
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
      });
    } else {
      logger.info("Deploying commands to development environment...");
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID || ""
        ),
        {
          body: commands,
        }
      );

      if (process.argv.includes("--global") || process.argv.includes("--globals") || process.argv.includes("-g")) {
        logger.info("Deploy commands globally...");
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
          body: commands,
        });
      }
    }

    logger.info("Successfully reloaded application (/) commands.");
  } catch (error) {
    logger.error(`Error deploying commands: ${error.message}`);
    process.exit(1);
  }
})();
