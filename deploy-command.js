const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discordjs");
const { getSecret } = require("./GCP/secret_manager");

const commands = [];
const folderPath = path.join(__dirname, "commands");
if (!fs.existsSync(folderPath)) {
  console.error(`[!] Commands folder not found at ${folderPath}`);
  process.exit(1);
}

const commandFiles = fs
  .readdirSync(folderPath)
  .filter((file) => file.endsWith(".js"));
if (commandFiles.length === 0) {
  console.error("[!] No command files found in the commands folder.");
  process.exit(1);
}

for (const file of commandFiles) {
  const filePath = path.join(folderPath, file);
  const command = require(filePath);
  if (!command.data || !command.execute) {
    console.error(`[!] Command file ${file} is missing required properties.`);
    continue;
  }
  commands.push(command.data.toJSON());
}

// Construct and prepare the REST client
const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_TOKEN || ""
);

async function deployCommands() {
  try {
    console.log("[ ] Started refreshing application (/) commands.");

    // Register commands with Discord
    if (!process.env.CLIENT_ID) {
      console.error("[!] CLIENT_ID environment variable is not set.");
      process.exit(1);
    }

    if (process.env.NODE_ENV === "production") {
      console.log("[ ] Deploying commands to production environment.");
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        {
          body: commands,
        }
      );
    } else {
      console.log("[ ] Deploying commands to development environment.");
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID || ""
        ),
        {
          body: commands,
        }
      );
    }

    console.log("[ ] Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(`[!] Error deploying commands: ${error.message}`);
    process.exit(1);
  }
}
