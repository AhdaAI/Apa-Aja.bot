const { database } = require("../../Utils/util");

module.exports = {
  async rule_management(serverId, action, id, new_value) {
    if (!id) return null;

    const rules_data = await database.readData(serverId, "rules");
    if (!rules_data || rules_data.data.length === 0) return null;

    const data = rules_data.data;

    if (action === "remove") {
      data.splice(id, 1);
      await database.updateData(serverId, "rules", { data: data });
    } else if (action === "update") {
      data.splice(id, 1, new_value);
      await database.updateData(serverId, "rules", { data: data });
    }
  },
};
