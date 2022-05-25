import { NextApiRequest, NextApiResponse } from "next";
import Web3 from "web3";
import config from "../../config.json";
import Bridge from "../../contracts/Bridge.json";

type Data = {
	pendingTransactions: any[];
};

const PendingTransactions = async (
	req: NextApiRequest,
	res: NextApiResponse<Data>
) => {
	const address = req.query.address as string;

	// if (!Web3.utils.isAddress(address))
	// 	return res.status(200).json({ pendingTransactions: [] });

	const RINKEBY_BRIDGE_ADDRESS = process.env.NEXT_PUBLIC_BRIDGE_ADDRESS_RINKEBY;
	const BSC_TESTNET_BRIDGE_ADDRESS =
		process.env.NEXT_PUBLIC_BRIDGE_ADDRESS_BSC_TESTNET;

	const RINKEBY_RPC_URL_HTTP =
		config.RINKEBY_RPC_URL_HTTP + process.env.NEXT_PUBLIC_INFURA_RINEKBY_ID;
	const BSC_TESTNET_RPC_URL_HTTP = config.TBSC_RPC_URL.replace(
		"wss://",
		"https://"
	)
		.replace("/ws", "")
		.replace("__KEY__", process.env.NEXT_PUBLIC_MORALIS_KEY || "");

	const provider_rinkeby = new Web3.providers.HttpProvider(
		RINKEBY_RPC_URL_HTTP
	);
	const web3_r = new Web3(provider_rinkeby);
	const provider_bsc_testnet = new Web3.providers.HttpProvider(
		BSC_TESTNET_RPC_URL_HTTP
	);
	const web3_b = new Web3(provider_bsc_testnet);

	const rinkebyBridge = new web3_r.eth.Contract(
		// @ts-ignore
		Bridge.abi,
		RINKEBY_BRIDGE_ADDRESS
	);
	const bscTestnetBridge = new web3_b.eth.Contract(
		// @ts-ignore
		Bridge.abi,
		BSC_TESTNET_BRIDGE_ADDRESS
	);

	// get burned tokens
	let [burnedTokensOnRinkeby, burnedTokensOnBscTestnet] = await Promise.all([
		rinkebyBridge.methods.recentlyBurned(address).call(),
		bscTestnetBridge.methods.recentlyBurned(address).call(),
	]);
	// get minted tokens
	const [mintedTokensOnBscTestnet, mintedTokensOnRinkeby] = await Promise.all([
		bscTestnetBridge.methods
			.recentlyMinted(burnedTokensOnRinkeby[0].nonce, address)
			.call(),
		rinkebyBridge.methods
			.recentlyMinted(burnedTokensOnBscTestnet[0].nonce, address)
			.call(),
	]);
	// filter burned tokens that are minted on the chain
	const unclaimedTxOnRinkeby = burnedTokensOnBscTestnet
		.map((bt: any, index: number) => ({
			amount: bt.amount,
			fromChainId: bt.toChainId === "4" ? 97 : 4,
			nonce: bt.nonce,
		}))
		.filter(
			(bt: any, index: number) =>
				!mintedTokensOnRinkeby[index] && bt.amount !== "0"
		);
	const unclaimedTxOnBscTestnet = burnedTokensOnRinkeby
		.map((bt: any, index: number) => ({
			amount: bt.amount,
			fromChainId: bt.toChainId === "4" ? 97 : 4,
			nonce: bt.nonce,
		}))
		.filter(
			(bt: any, index: number) =>
				!mintedTokensOnBscTestnet[index] && bt.amount !== "0"
		);

	res.json({
		pendingTransactions: [...unclaimedTxOnRinkeby, ...unclaimedTxOnBscTestnet],
	});
};

export default PendingTransactions;
