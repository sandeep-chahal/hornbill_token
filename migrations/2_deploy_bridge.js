require("dotenv").config();
const HornBill = artifacts.require("HornBill");
const Bridge = artifacts.require("Bridge");
const config = require("../config.json");

module.exports = async (deployer, network, accounts) => {
	const ORACLE_ADDRESS =
		network === "rinkeby"
			? config.RINKEBY_ORACLE_ADDRESS
			: config.TBSC_ORACLE_ADDRESS;

	const JOB_ID =
		network === "rinkeby" ? config.RINKEBY_JOB_ID : config.TBSC_JOB_ID;

	const ORACLE_FEE =
		network === "rinkeby" ? config.RINKEBY_ORACLE_FEE : config.TBSC_ORACLE_FEE;
	const LINK_TOKEN =
		network === "rinkeby"
			? config.RINKEBY_LINK_ADDRESS
			: config.TBSC_LINK_ADDRESS;

	const API_URL = process.env.API_URL;

	const hb = await HornBill.deployed();
	await deployer.deploy(
		Bridge,
		hb.address,
		accounts[0],
		API_URL,
		ORACLE_ADDRESS,
		web3.utils.asciiToHex(JOB_ID),
		web3.utils.toWei(String(ORACLE_FEE)),
		LINK_TOKEN
	);
};
