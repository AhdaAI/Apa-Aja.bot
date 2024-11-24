const {
  SlashCommandBuilder,
  ChannelType,
  PermissionsBitField,
  CommandInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  EmbedBuilder,
} = require("discord.js");
const { database } = require("../Utils/util");

async function findMessageInGuild(guild, messageId) {
  // Get all text-based channels in the guild
  const channels = guild.channels.cache.filter(
    (channel) =>
      channel.type === ChannelType.GuildText ||
      channel.type === ChannelType.GuildAnnouncement
  );

  for (const [channelId, channel] of channels) {
    const message = await channel.messages.fetch(messageId).catch((error) => {
      console.log(`Message not found in channel: ${channel.name}`);
      console.log(`Error fetching message: ${error.status}`);
    });
    if (message) {
      console.log(`Message found in channel: ${channel.name}`);
      return message;
    }
  }

  // If we get here, the message was not found
  console.log("Message not found in any text channel.");
  return null;
}

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
    const user = interaction.member;
    if (!user.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      await interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true,
      });
      return;
    }

    const serverId = interaction.guildId;

    switch (interaction.options.getSubcommand()) {
      case "register":
        const roles = interaction.guild.roles.cache;
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
        await interaction.deferReply({
          content: "Updating role...",
          ephemeral: true,
        });
        const channel = interaction.options.getChannel("channel");
        const serverData = await database.readData(serverId, "misc");
        const embed = new EmbedBuilder()
          .setTitle(serverData ? serverData.data.title : interaction.guild.name)
          .setDescription(serverData ? serverData.data.description : null)
          .setThumbnail(interaction.guild.iconURL())
          .setURL(serverData ? serverData.data.url : null)
          .setTimestamp();

        const rules = await database.readData(serverId, "rules");
        if (rules != null) {
          embed.addFields({
            name: "Rules",
            value: await database.readData(serverId, "rules"),
            inline: true,
          });
        }

        const rolesList = await database.readData(serverId, "role");
        const selectDisplay = new StringSelectMenuBuilder()
          .setCustomId("selectrole")
          .setPlaceholder("Select role...");
        if (rolesList == null || rolesList.data.length == 0) {
          await interaction.reply({
            content: "Role not found. Please add role or update role.",
            ephemeral: true,
          });
          await channel.send({ embeds: [embed] });
          break;
        }

        rolesList.data.forEach((rl) =>
          selectDisplay.addOptions({ label: rl.name, value: rl.id })
        );

        const message = await database.readData(serverId, "message");
        if (message == null) {
          const messageID = await channel.send({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(selectDisplay)],
          });

          await database.addData(serverId, "message", { data: messageID.id });
        } else {
          const existMessage = await findMessageInGuild(
            interaction.guild,
            message.data
          );
          if (existMessage != null) existMessage.delete();

          const messageID = await channel.send({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(selectDisplay)],
          });

          await database.updateData(serverId, "message", {
            data: messageID.id,
          });
        }
        await interaction.editReply({
          content: `Role updated.\nPlease Check ${channel}`,
        });
        break;

      default:
        break;
    }
  },
};
