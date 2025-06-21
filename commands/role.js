const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionsBitField,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const {
  getGuildConfig,
  updateGuildConfig,
  setGuildConfig,
  checkGuildConfig,
  addGuildRole,
  removeGuildRole,
} = require("../GCP/firestore");

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
        .addStringOption((option) =>
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
        .addStringOption((option) =>
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
    const { options } = interaction;
    const subCommand = options.getSubcommand();

    if (subCommand === "help") {
      await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: "Add and remove role based on the selected role or the role id."
      })
      return
    }

    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: "Processing command...",
    });

    const dataExists = await checkGuildConfig(interaction.guildId);
    if (!dataExists) {
      try {
        const defaultData = {
          id: interaction.guild.id,
          title: interaction.guild.name,
          roles: [],
          subscription: {
            epic: false,
            steam: false,
          },
          webhook: "",
        };
        await setGuildConfig(interaction.guildId, defaultData);
      } catch (error) {
        throw error;
      }
    }

    const roleID = options.getString("id");

    let role = options.getRole("role");

    if (roleID && !role) {
      try {
        role =
          interaction.guild.roles.cache.get(roleID) ??
          (await interaction.guild.roles.fetch(roleID));
      } catch (error) {
        console.log(`[?] Error fetching role ${roleID}`);
        await interaction.followUp({
          flags: MessageFlags.Ephemeral,
          content: `Could not find role ID : ${roleID}`,
        });
        return;
      }
    }

    const newRole = {
      name: role.name,
      id: role.id,
    };
    if (subCommand === "add") {
      await addGuildRole(interaction.guild.id, newRole);
      await interaction.followUp({
        flags: MessageFlags.Ephemeral,
        content: `Successfully adding role ${role.name}.`,
      });
    }

    if (subCommand === "remove") {
      await removeGuildRole(interaction.guild.id, newRole);
      await interaction.followUp({
        flags: MessageFlags.Ephemeral,
        content: `Successfully removing role ${role.name}.`,
      });
    }
  },
};
