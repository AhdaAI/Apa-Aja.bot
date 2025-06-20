const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`[!] Command ${interaction.commandName} not found.`);
      return;
    }

    try {
      await command.execute(interaction, client);
      console.log(
        `[ ] Command ${interaction.commandName} executed successfully.`
      );
    } catch (error) {
      console.error(
        `[!] Error executing command ${interaction.commandName}:`,
        error
      );
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  },
};
