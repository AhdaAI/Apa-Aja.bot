const {
  SlashCommandBuilder,
  PermissionsBitField,
  CommandInteraction,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Administration control.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const user = interaction.member;
    if (!user.permissions.has(PermissionsBitField.Flags.Administrator)) {
      await interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true,
      });
      return;
    }

    await interaction.reply({
      content: "Command is not available.",
      ephemeral: true,
    });
  },
};
