const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionsBitField,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Manage roles for users")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand.setName("help").setDescription("Show help.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Adding new role to database.")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("Choose the role...")
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("Input role ID...")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove role from database.")
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("Choose the role...")
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName("id")
            .setDescription("Input role ID...")
            .setRequired(false)
        )
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
      await interaction.reply({flags: MessageFlags.Ephemeral, content: "Processing command..."})

      const {options} = interaction
      const subCommand = options.getSubcommand()
      const roleID = options.getInteger('id')
      let role

      if (subCommand === "add") {
        role = options.getRole('role')

        if (roleID && !role) {
          try {
            role = interaction.guild.roles.cache.get(roleID) ?? await interaction.guild.roles.fetch(roleID)
          } catch (error) {
            console.log(`[?] Error fetching role ${roleID}`)
            await interaction.followUp({flags: MessageFlags.Ephemeral, content: `Could not find role ID : ${roleID}`})
          }
        }

      }
    }
};
