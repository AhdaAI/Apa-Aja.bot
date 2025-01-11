const { database } = require("../../Utils/util");

module.exports = {
  /**
   *
   * @param {*} serverId Required
   * @param {*} action  Required
   * @param {*} id Default 0
   * @param {*} value Default ""
   * @returns
   */
  async role_management(serverId, action, id, value) {
    id = id ?? 0;
    value = value ?? "";

    const role_data = await database.readData(serverId, "role");
    if (!role_data || role_data.data.length === 0) return null;

    const data = role_data.data;
    switch (action) {
      case "remove":
        const new_role = data.filter((rl) => rl !== data[id]);
        await database.updateData(serverId, "role", { data: new_role });
        break;

      case "update":
        console.log("Feature has not been implemented yet.");
        break;

      default:
        break;
    }
  },
};
