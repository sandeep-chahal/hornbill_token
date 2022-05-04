require("dotenv").config();
const HornBill = artifacts.require("HornBill");

module.exports = function (deployer) {
	deployer.deploy(HornBill, "0xaD6D458402F60fD3Bd25163575031ACDce07538D");
};
