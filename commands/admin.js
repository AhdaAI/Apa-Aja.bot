const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} = require("discord.js");
const { loadDefaultConfig, setGuildConfig } = require("../GCP/firestore");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Admin Control.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reset")
        .setDescription("Reset database to default value.")
    ),

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const guild = interaction.guild;
    const options = interaction.options;
    const subcommand = options.getSubcommand();

    /**
     * RESET FUNCTION
     */
    if (subcommand === "reset") {
      await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: "Processing command...",
      });

      const data = await loadDefaultConfig();
      data.title = guild.name;
      data.id = guild.id;
      await setGuildConfig(guild.id, data);

      return await interaction.editReply({
        flags: MessageFlags.Ephemeral,
        content: "Process Complete!",
      });
    }
  },
};
