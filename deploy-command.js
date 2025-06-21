const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
const { getSecret } = require("./GCP/secret_manager");

// Load environment variables
let envFileName;
if (process.env.NODE_ENV === "production") {
  console.log("===== Running in production environment. =====");
  envFileName = ".env.production";
} else {
  console.log("===== Running in development environment. =====");
  envFileName = ".env.development";
}

let envFilePath = path.join(__dirname, envFileName);
if (!fs.existsSync(envFilePath)) {
  console.error(
    `[!] Environment file ${envFileName} not found at ${envFilePath}`
  );
  console.log(
    "[?] Please create the file with the required environment variables."
  );
  process.exit(1);
}
try {
  const envFile = fs.readFileSync(envFilePath, "utf8");
  const envLines = envFile.split("\n");
  envLines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, value] = trimmedLine.split("=");
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
  console.log("[ ] Environment variables loaded successfully.");
} catch (error) {
  console.error(`[?] Error reading .env file: ${error.message}`);
  process.exit(1);
}

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

(async () => {
  // Register commands with Discord
  if (!process.env.CLIENT_ID) {
    console.error("[!] CLIENT_ID environment variable is not set.");
    process.exit(1);
  }

  try {
    console.log("[ ] Attempting to delete all global commands...");
    // Sending an empty array to the global commands endpoint
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: [] } // Send an empty array
    );

    console.log("[ ] Started refreshing application (/) commands.");

    if (process.env.NODE_ENV === "production") {
      console.log("[ ] Deploying commands to production environment.");
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
      });
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
})();
