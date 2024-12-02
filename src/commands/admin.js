const {
  SlashCommandBuilder,
  PermissionsBitField,
  CommandInteraction,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SlashCommandIntegerOption,
} = require("discord.js");
const { database } = require("../Utils/util");
const { rule_management } = require("./admin_subcommands/rule_management");
const { role_management } = require("./admin_subcommands/role_management");
const { misc_management } = require("./admin_subcommands/misc_management");
const { admin_embed } = require("./admin_subcommands/admin_embed");

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
        .addStringOption(
          new SlashCommandStringOption()
            .setName("value")
            .setDescription("Add value.")
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

    await interaction.deferReply({ ephemeral: true });

    const serverId = interaction.guildId;

    switch (interaction.options.getSubcommand()) {
      case "rules":
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
          content: `Misc updated.\nOption: ${option}\nValue: ${value}`,
          ephemeral: true,
        });

        break;

      case "manage":
        const type = interaction.options.getString("type");
        const action = interaction.options.getString("action");
        const id = interaction.options.getInteger("id");
        const new_value = interaction.options.getString("value");

        switch (type) {
          case "rule":
            await rule_management();
            await interaction.editReply({
              content: `Rule ${action}`,
              ephemeral: true,
            });
            break;

          case "role":
            if (action == "update") {
              await interaction.editReply({
                content: "Feature has not been implemented yet.",
                ephemeral: true,
              });
              break;
            }

            await role_management(serverId, action, id);
            await interaction.editReply({
              content: `Role ${action}`,
              ephemeral: true,
            });
            break;

          case "misc":
            await misc_management(serverId, action, id, new_value);
            await interaction.editReply({
              content: `Misc ${action}`,
              ephemeral: true,
            });
            break;

          default:
            await interaction.editReply({
              content: "No action taken.",
              ephemeral: true,
            });
            break;
        }

        break;

      default:
        await interaction.editReply({
          content: "Something went wrong.",
          ephemeral: true,
        });
        break;
    }

    await interaction.followUp({
      embeds: [await admin_embed(serverId)],
      ephemeral: true,
    });
  },
};
