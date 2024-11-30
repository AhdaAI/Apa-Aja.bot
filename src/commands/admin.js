const {
  SlashCommandBuilder,
  PermissionsBitField,
  CommandInteraction,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SlashCommandIntegerOption,
} = require("discord.js");
const { database } = require("../Utils/util");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDescription("Administration control.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("rules")
        .setDescription("Add rules.")
        .addStringOption(
          new SlashCommandStringOption()
            .setName("rule")
            .setDescription("Add rules.")
            .setRequired(true)
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("manage")
        .setDescription("Manage server.")
        .addStringOption(
          new SlashCommandStringOption()
            .setName("type")
            .setDescription("Select the data.")
            .addChoices(
              { name: "Role", value: "role" },
              { name: "Rule", value: "rule" },
              { name: "Misc", value: "misc" }
            )
        )
        .addStringOption(
          new SlashCommandStringOption()
            .setName("action")
            .setDescription("Select the action.")
            .setChoices(
              { name: "Update", value: "update" },
              { name: "Remove", value: "remove" }
            )
        )
        .addIntegerOption(
          new SlashCommandIntegerOption()
            .setName("id")
            .setDescription("Select the id.")
        )
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName("misc")
        .setDescription("Manage misc attribute.")
        .addStringOption(
          new SlashCommandStringOption()
            .setName("options")
            .setDescription("Select the data.")
            .addChoices(
              { name: "title", value: "title" },
              { name: "description", value: "description" },
              { name: "url", value: "url" }
            )
            .setRequired(true)
        )
        .addStringOption(
          new SlashCommandStringOption()
            .setName("value")
            .setDescription("Add value.")
            .setRequired(true)
        )
    ),

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

    const serverId = interaction.guildId;

    switch (interaction.options.getSubcommand()) {
      case "rules":
        await interaction.deferReply({ ephemeral: true });
        const rule = interaction.options.getString("rule");
        const rules_data = await database.readData(serverId, "rules");

        if (rules_data) {
          rules_data.data.push(rule);
          await database.updateData(serverId, "rules", rules_data);
        } else {
          await database.addData(serverId, "rules", { data: [rule] });
        }

        await interaction.editReply({
          content: `Rule added.\nRule: ${rule}`,
          ephemeral: true,
        });
        break;

      case "misc":
        await interaction.deferReply({ ephemeral: true });
        const option = interaction.options.getString("options");
        const value = interaction.options.getString("value");
        const misc_data = await database.readData(serverId, "misc");

        if (misc_data) {
          misc_data.data[option] = value;
          await database.updateData(serverId, "misc", misc_data);
        } else {
          await database.addData(serverId, "misc", {
            data: { option: value },
          });
        }

        await interaction.editReply({
          content: "Misc updated.",
          ephemeral: true,
        });
        break;

      default:
        break;
    }
  },
};
