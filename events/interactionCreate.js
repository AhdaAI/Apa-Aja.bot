const {
  Events,
  ChatInputCommandInteraction,
  MessageFlags,
} = require("discord.js");
const logger = require("../utility/logger");

module.exports = {
  name: Events.InteractionCreate,
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {*} client
   * @returns
   */
  async execute(interaction, client) {
    // === String Select Menu execution
    if (interaction.isStringSelectMenu()) {
      const customId = interaction.customId;
      // Checking custom id
      try {
        if (customId === "role") {
          const selectedValue = interaction.values[0];
          const role = interaction.guild.roles.cache.get(selectedValue);

          // Checking for role assign or remove
          const member = interaction.member;
          if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
          } else {
            await member.roles.add(role);
          }

          return await interaction.update({
            content: `Role update for ${interaction.user.username}`,
          });
        }
      } catch (error) {
        logger.error(error);
      }
    }

    // === Command execution
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        logger.warn(`Command ${interaction.commandName} not found.`);
        return;
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        logger.error(
          `Error executing command ${interaction.commandName}:`,
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
    }
  },
};
