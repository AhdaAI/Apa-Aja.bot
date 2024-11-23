const {
  SlashCommandBuilder,
  ChannelType,
  PermissionsBitField,
  CommandInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");
const { database } = require("../Utils/util");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Manage role for user.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("register")
        .setDescription("[ Admin ] Add or remove role from dropdown menu.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("update")
        .setDescription("[ Admin ] Update dropdown menu.")
        .addChannelOption((channel) =>
          channel
            .setName("channel")
            .setDescription("Select channel to update dropdown menu.")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    ),

  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    const serverId = interaction.guildId;
    const roles = interaction.guild.roles.cache;

    switch (interaction.options.getSubcommand()) {
      case "register":
        const options = [];
        roles.forEach((element) => {
          options.push({ label: element.name, value: element.id });
        });

        const select = new StringSelectMenuBuilder()
          .setCustomId("role")
          .setPlaceholder("Select role...")
          .addOptions(options);

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({ components: [row] });
        break;

      case "update":
        break;

      default:
        break;
    }
  },
};
