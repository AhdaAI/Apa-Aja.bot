const { database } = require("../../Utils/util");

module.exports = {
  /**
   *
   * @param {*} serverId Required
   * @param {*} action Remove / Update | Required
   * @param {*} id Required
   * @param {*} new_value Required
   * @returns
   */
  async misc_management(serverId, action, id, new_value) {
    if (!id || !new_value) return null;

    const misc_data = await database.readData(serverId, "misc");
    if (!misc_data || misc_data.data.length() === 0) return null;

    console.log(misc_data);
  },
};
