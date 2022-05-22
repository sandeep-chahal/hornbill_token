import { NextApiRequest, NextApiResponse } from "next";
import config from "../../config.json";
import Web3 from "web3";
import Bridge from "../../contracts/Bridge.json";

type Data = {
	AMOUNT: string;
};

type Result = {
	amount: any;
	toChainId: any;
};

const Handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
	const nonce = req.query.nonce;
	const address = req.query.address;
	const chainId = parseInt(req.query.fromChainId as string);
	console.log({
		nonce,
		address,
		chainId,
	});
	if (
		!nonce ||
		!address ||
		!chainId ||
		config.CHAIN_IDS.includes(chainId) === false
	) {
		res.status(200).json({
			AMOUNT: "0",
		});
		return;
	}
	const BridgeAddress =
		chainId === 4
			? process.env.NEXT_PUBLIC_BRIDGE_ADDRESS_RINKEBY
			: process.env.NEXT_PUBLIC_BRIDGE_ADDRESS_BSC_TESTNET;

	const RPC_URL_HTTP =
		chainId === 4
			? config.RINKEBY_RPC_URL_HTTP + process.env.NEXT_PUBLIC_INFURA_RINEKBY_ID
			: config.TBSC_RPC_URL.replace("wss://", "https://")
					.replace("/ws", "")
					.replace("__KEY__", process.env.NEXT_PUBLIC_MORALIS_KEY || "");

	console.log({
		BridgeAddress,
		RPC_URL_HTTP,
	});

	const provider = new Web3.providers.HttpProvider(RPC_URL_HTTP);
	const web3 = new Web3(provider);

	// @ts-ignore
	const bridge = new web3.eth.Contract(Bridge.abi, BridgeAddress);
	const result: Result = await bridge.methods
		.burnedTokens(address, nonce)
		.call();

	const AMOUNT = web3.utils.fromWei(result.amount, "ether");
	res.status(200).json({
		AMOUNT,
	});
};

export default Handler;
