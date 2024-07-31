const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("DAOModule", (m) => {
 
  const lock = m.contract("DAO", []);

  return { lock };
});
