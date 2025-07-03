const { Events, Guild, Client } = require("discord.js");
const { setGuildConfig, loadDefaultConfig } = require("../GCP/firestore");

module.exports = {
  name: Events.GuildCreate,
  /**
   *
   * @param {Guild} guild
   */
  async execute(guild) {
    try {
      const defaultData = await loadDefaultConfig();
      defaultData.id = guild.id;
      defaultData.title = guild.name;

      await setGuildConfig(guild.id, defaultData);
    } catch (error) {
      throw error;
    }
  },
};
