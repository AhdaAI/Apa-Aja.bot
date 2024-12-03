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
    const misc_data = await database.readData(serverId, "misc");
    if (!misc_data || misc_data.length === 0) return null;

    const data = misc_data.data;
    const keys_obj = Object.keys(data);
    const looked = keys_obj[id];

    if (action === "remove") {
      data[looked] = null;
      await database.updateData(serverId, "misc", { data: data });
    } else if (action === "update") {
      data[looked] = new_value;
      await database.updateData(serverId, "misc", { data: data });
    }
  },
};
