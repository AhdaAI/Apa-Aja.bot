const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),

  dev: true,

  async execute(interaction) {
    await interaction.reply("Pong!");
  },
};
