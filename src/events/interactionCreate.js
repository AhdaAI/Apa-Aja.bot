const {
  Events,
  CommandInteraction,
  PermissionsBitField,
} = require("discord.js");
const { database } = require("../Utils/util");

module.exports = {
  name: Events.InteractionCreate,
  /**
   *
   * @param {CommandInteraction} interaction
   */
  async execute(interaction) {
    if (interaction.isStringSelectMenu()) {
      switch (interaction.customId) {
        case "role":
          const user = interaction.member;
          if (!user.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            await interaction.reply({
              content: "You don't have permission to use this command.",
              ephemeral: true,
            });
            return;
          }

          await interaction.update({ content: "" });
          const selected = await interaction.guild.roles.fetch(
            interaction.values[0]
          );
          const selectedGuild = interaction.guildId;

          const cleanSelected = { name: selected.name, id: selected.id };

          const roleList = await database.readData(selectedGuild, "role");

          if (!roleList) {
            await database.addData(selectedGuild, "role", {
              data: [cleanSelected],
            });
            break;
          }

          const currentList = roleList.data;
          let updatedList;

          if (currentList.some((rl) => rl.id == cleanSelected.id)) {
            updatedList = currentList.filter((rl) => rl.id != cleanSelected.id);
          } else {
            updatedList = currentList;
            updatedList.push(cleanSelected);
          }

          await database.updateData(selectedGuild, "role", {
            data: updatedList,
          });
          break;

        case "selectrole":
          await interaction.update({ content: "" });
          const selectedRole = await interaction.guild.roles.fetch(
            interaction.values[0]
          );
          const member = interaction.member;

          member.roles.cache.some((rl) => rl.id == selectedRole.id)
            ? await member.roles.remove(selectedRole)
            : await member.roles.add(selectedRole);
          break;
        default:
          await interaction.reply({
            content: "Failed to find select menu.",
            ephemeral: true,
          });
          break;
      }

      return;
    }

    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  },
};
