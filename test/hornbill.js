require("dotenv").config();
const config = require("../config.json");
const HornBill = artifacts.require("HornBill");
const ERC20 = artifacts.require("ERC20");
const truffleAssert = require("truffle-assertions");

const DAI_ADDRESS = config.RINKEBY_DAI_ADDRESS;
const DAI_HOLDER = config.RINKEBY_DAI_HOLDER;
const MAX_AMOUNT =
	"115792089237316195423570985008687907853269984665640564039457584007913129639935";

contract("HornBill", (accounts) => {
	let hornBill = null;
	let dai = null;

	beforeEach(async () => {
		hornBill = await HornBill.new(DAI_ADDRESS);
		dai = await ERC20.at(DAI_ADDRESS);
	});

	it("should throw error when buy token w/o dai approved", async () => {
		await truffleAssert.reverts(
			hornBill.buy(10, { from: DAI_HOLDER }),
			"Dai/insufficient-allowance."
		);
	});
	it("should approve dai to be spend by contract", async () => {
		const tx = await dai.approve(hornBill.address, MAX_AMOUNT, {
			from: DAI_HOLDER,
		});
		truffleAssert.eventEmitted(tx, "Approval", (ev) => {
			return (
				ev.owner === DAI_HOLDER &&
				ev.spender === hornBill.address &&
				ev.value.toString() === MAX_AMOUNT
			);
		});
	});

	it("should buy HB tokens for dai", async () => {
		await dai.approve(hornBill.address, MAX_AMOUNT, {
			from: DAI_HOLDER,
		});
		const daiHolderDaiBalance_Before = await dai.balanceOf(DAI_HOLDER);

		const amount = web3.utils.toWei("25");
		await hornBill.buy(amount, { from: DAI_HOLDER });

		const daiHolderDaiBalance_After = await dai.balanceOf(DAI_HOLDER);
		const totalSupply = await hornBill.totalSupply();
		const balance = await hornBill.balanceOf(DAI_HOLDER);
		const reserve = await dai.balanceOf(hornBill.address);

		assert.equal(totalSupply, amount);
		assert.equal(balance, amount);
		assert.equal(reserve, amount);
		assert(daiHolderDaiBalance_Before.sub(daiHolderDaiBalance_After) <= amount);
	});

	it("should sell HB tokens for dai", async () => {
		await dai.approve(hornBill.address, MAX_AMOUNT, {
			from: DAI_HOLDER,
		});

		const daiHolderDaiBalance_Before = await dai.balanceOf(DAI_HOLDER);

		const amount = web3.utils.toWei("25");
		// buy
		await hornBill.buy(amount, { from: DAI_HOLDER });

		// sell
		await hornBill.sell(amount, { from: DAI_HOLDER });
		const totalSupplyAfterSell = await hornBill.totalSupply();
		const balanceAfterSell = await hornBill.balanceOf(DAI_HOLDER);
		const reserveAfterSell = await dai.balanceOf(hornBill.address);
		const daiHolderDaiBalance_After = await dai.balanceOf(DAI_HOLDER);

		assert.equal(totalSupplyAfterSell, 0);
		assert.equal(balanceAfterSell, 0);
		assert.equal(reserveAfterSell, 0);
		assert.equal(
			daiHolderDaiBalance_After.toString(),
			daiHolderDaiBalance_Before.toString()
		);
	});
});
