require("dotenv").config();
const HornBill = artifacts.require("HornBill");

module.exports = function (deployer) {
	deployer.deploy(HornBill, process.env.DAI_ADDRESS);
};
