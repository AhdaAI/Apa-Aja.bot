const { Events, Guild } = require("discord.js");
const { setGuildConfig } = require("../GCP/firestore");

module.exports = {
  name: Events.GuildCreate,
  /**
   *
   * @param {Guild} guild
   */
  async execute(guild) {
    try {
      const guildData = {
        id: guild.id,
        title: guild.name,
        roles: [],
        subscription: {
          epic: false,
          steam: false,
        },
        webhook: "",
      };

      await setGuildConfig(guild.id, guildData);
    } catch (error) {
      throw error;
    }
  },
};
