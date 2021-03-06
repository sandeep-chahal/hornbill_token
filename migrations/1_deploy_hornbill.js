require("dotenv").config();
const HornBill = artifacts.require("HornBill");
const Bridge = artifacts.require("Bridge");
const config = require("../config.json");

module.exports = async (deployer, network, accounts) => {
	const DAI_ADDRESS =
		network === "rinkeby"
			? config.RINKEBY_DAI_ADDRESS
			: config.TBSC_DAI_ADDRESS;

	await deployer.deploy(HornBill, DAI_ADDRESS, accounts[0], accounts[0]);
};
