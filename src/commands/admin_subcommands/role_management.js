const { database } = require("../../Utils/util");

module.exports = {
  async role_management() {
    const role_data = await database.readData("role");
    console.log(role_data);
  },
};
