const { database } = require("../../Utils/util");

module.exports = {
  async rule_management() {
    const rules_data = await database.readData("rules");
    console.log(rules_data);
  },
};
