const { EmbedBuilder, codeBlock } = require("discord.js");
const { database } = require("../../Utils/util");

module.exports = {
  async admin_embed(serverId) {
    const embed = new EmbedBuilder()
      .setTitle("Server Management")
      .setDescription(
        "Complete list of data stored in server.\n[ ID ] - [ Data ]"
      )
      .setTimestamp();

    let num = 0;

    const rules = await database.readData(serverId, "rules");
    if (rules != null && rules.data.length > 0) {
      num = 0;
      const displayed_rules = rules.data.map((dat) => {
        const temp_data = `${num} - ${dat}`;
        num++;

        return temp_data;
      });

      embed.addFields({
        name: "Rules",
        value: displayed_rules.join("\n") ?? "No rules found.",
        inline: true,
      });
    }

    const roles = await database.readData(serverId, "role");
    if (roles != null && roles.data.length > 0) {
      num = 0;
      const displayed_roles = roles.data.map((dat) => {
        const temp_data = `${num} - ${dat.name}`;
        num++;

        return temp_data;
      });

      embed.addFields({
        name: "Roles",
        value: displayed_roles.join("\n") ?? "No roles found.",
        inline: true,
      });
    }

    const misc = await database.readData(serverId, "misc");
    if (misc != null) {
      misc.embed.addFields({
        name: "Misc",
        value: codeBlock(JSON.stringify(misc.data, null, 2)),
        inline: false,
      });
    }

    return embed;
  },
};
