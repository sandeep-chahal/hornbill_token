require("dotenv").config();
const HornBill = artifacts.require("HornBill");
const Bridge = artifacts.require("Bridge");
const config = require("../config.json");

module.exports = async (deployer, network, accounts) => {
	const bridge = await Bridge.deployed();
	const hb = await HornBill.deployed();
	await hb.setBridge(bridge.address, {
		from: accounts[0],
	});
};
