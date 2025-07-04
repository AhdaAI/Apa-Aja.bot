const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionsBitField,
  EmbedBuilder,
  PermissionFlagsBits,
  codeBlock,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");
const {
  getGuildConfig,
  updateGuildConfig,
  setGuildConfig,
  checkGuildConfig,
  addGuildRole,
  removeGuildRole,
  loadDefaultConfig,
} = require("../GCP/firestore");
const path = require("path");
const fs = require("fs").promises;
const logger = require("../utility/logger");

/**
 * @typedef {object} DefaultRoleConfig
 * @property {string} id
 * @property {string} name
 */
async function loadRoleConfig() {
  try {
    const roleConfigPath = path.join(__dirname, "../.gcloud/role_default.json");
    const data = await fs.readFile(roleConfigPath, "utf8");
    /**@type {DefaultRoleConfig} */
    const parsedConfig = JSON.parse(data);

    return parsedConfig;
  } catch (error) {
    logger.warn(error);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Manage roles for users")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand.setName("help").setDescription("Show help.")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("show").setDescription("Show list of role registered.")
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
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("publish")
        .setDescription("Publish the dropdown menu to selected channel.")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Target channel.")
            .setRequired(true)
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
        content:
          "Add and remove role based on the selected role or the role id.",
      });
      return;
    }

    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      content: "Processing command...",
    });

    if (subCommand === "publish") {
      const channel = interaction.options.getChannel("channel");
      const data = await getGuildConfig(interaction.guild.id);
      const dropOptions = [];
      data.roles.forEach((element) => {
        dropOptions.push(
          new StringSelectMenuOptionBuilder()
            .setLabel(element.name)
            .setValue(element.id)
        );
      });
      const dropDown = new StringSelectMenuBuilder()
        .setCustomId("role")
        .setPlaceholder("Choose your role...")
        .addOptions(dropOptions);

      const actionRow = new ActionRowBuilder().addComponents(dropDown);
      await interaction.editReply({ content: "Dropdown published!" });
      return await channel.send({ components: [actionRow] });
    }

    if (subCommand === "show") {
      const data = await getGuildConfig(interaction.guild.id);
      const embedFields = [];
      for (const key of Object.keys(data)) {
        if (
          key === "lastUpdated" ||
          data[key] === "" ||
          data[key].length === 0
        ) {
          continue;
        }

        const fieldTitle = key.charAt(0).toUpperCase() + key.slice(1);
        if (key === "subscription") {
          const listSub = [
            `Epic: ${data[key].epic}`,
            `Steam: ${data[key].steam}`,
          ];
          embedFields.push({
            name: fieldTitle,
            value: codeBlock(listSub.join("\n")),
            inline: true,
          });
          continue;
        }

        if (key === "roles") {
          const roles = [];
          for (const role of data[key]) {
            roles.push(role.name);
          }

          embedFields.push({
            name: fieldTitle,
            value: codeBlock(roles.join("\n")),
            inline: true,
          });
          continue;
        }

        embedFields.push({
          name: fieldTitle,
          value: codeBlock(data[key]),
          inline: true,
        });
      }
      const embed = new EmbedBuilder()
        .setTitle("Stored Data")
        .setFields(embedFields)
        .setThumbnail(interaction.guild.iconURL())
        .setTimestamp(data.lastUpdated.toDate());

      await interaction
        .editReply({
          flags: MessageFlags.Ephemeral,
          embeds: [embed],
          content: "Process Complete!",
        })
        .catch((error) => logger.error(error));

      return;
    }

    /* 
      Role Adding and Removing functions 
    */
    const roleID = options.getString("id");

    let role = options.getRole("role");

    if (roleID && !role) {
      try {
        role =
          interaction.guild.roles.cache.get(roleID) ??
          (await interaction.guild.roles.fetch(roleID));
      } catch (error) {
        logger.warn(`Error fetching role ${roleID}`);
        await interaction.followUp({
          flags: MessageFlags.Ephemeral,
          content: `Could not find role ID : ${roleID}`,
        });
        return;
      }
    }

    const newRole = await loadRoleConfig();
    newRole.name = role.name;
    newRole.id = role.id;
    if (subCommand === "add") {
      const responses = [
        "# ABORTED",
        "## Hierarchy issue",
        "Bot hierarchy is lower then the selected role, please move bot role higher.",
      ];
      const botHighestRole = interaction.guild.members.me.roles.highest;
      if (botHighestRole.position < role.position) {
        return await interaction.editReply({
          flags: MessageFlags.Ephemeral,
          content: responses.join("\n"),
        });
      }

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
