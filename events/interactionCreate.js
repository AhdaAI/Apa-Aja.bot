const {
  Events,
  ChatInputCommandInteraction,
  MessageFlags,
} = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} client
   * @returns
   */
  async execute(interaction, client) {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`[!] Command ${interaction.commandName} not found.`);
      return;
    }

    try {
      await command.execute(interaction, client);
    } catch (error) {
      console.error(
        `[!] Error executing command ${interaction.commandName}:`,
        error
      );
      if (interaction.replied) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  },
};
