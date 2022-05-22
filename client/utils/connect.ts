import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Portis from "@portis/web3";
import Web3 from "web3";

import ERC20 from "../contracts/ERC20.json";
import HB from "../contracts/HornBill.json";
import config from "../config.json";
import { IBridge, Iw3 } from "../store";
import Bridge from "../contracts/Bridge.json";

import { isBrowser } from ".";

const connect = async (wallet: string | null, chainId: number | null) => {
	try {
		if (wallet === null || chainId === null) {
			console.log("need to manually connect", wallet, chainId);
			return null;
		}
		if (!config.CHAIN_IDS.includes(chainId)) {
			console.log("Wrong chain Id", chainId);
			return null;
		}
		console.log("connecting using", wallet, chainId);

		// env vars start
		const PORTIS_ID = process.env.NEXT_PUBLIC_PORTIS_ID || "";

		const RPC_URL_RINKEBY =
			config.RINKEBY_RPC_URL + process.env.NEXT_PUBLIC_INFURA_RINEKBY_ID;

		const RPC_HTTP_URL_RINKEBY = RPC_URL_RINKEBY.replace(
			"wss://",
			"https://"
		).replace("/ws", "");

		const RPC_URL_BSC_TESTNET = config.TBSC_RPC_URL.replace(
			"__KEY__",
			process.env.NEXT_PUBLIC_MORALIS_KEY || ""
		);

		const RPC_HTTP_URL_BSC_TESTNET = RPC_URL_BSC_TESTNET.replace(
			"wss://",
			"https://"
		).replace("/ws", "");
		const RPC_URL = chainId === 4 ? RPC_URL_RINKEBY : RPC_URL_BSC_TESTNET;
		const RPC_URL_HTTP =
			chainId === 4 ? RPC_HTTP_URL_RINKEBY : RPC_HTTP_URL_BSC_TESTNET;

		// env vars ends

		let provider: any = null;

		if (wallet === "METAMASK") {
			provider = window.ethereum;
		} else if (wallet === "COINBASE") {
			const coinbaseWallet = new CoinbaseWalletSDK({
				appName: "HornBill Token",
				appLogoUrl: window.location.host + "/hornbill.jpg",
			});
			provider = coinbaseWallet.makeWeb3Provider(RPC_URL, chainId);
		} else if (wallet === "WALLETCONNECT") {
			provider = new WalletConnectProvider({
				chainId: chainId,
				rpc: {
					4: RPC_HTTP_URL_RINKEBY,
					97: RPC_HTTP_URL_BSC_TESTNET,
				},
			});
			provider.updateRpcUrl(chainId);
		} else if (wallet === "PORTIS") {
			const portis = new Portis(PORTIS_ID, {
				nodeUrl: RPC_URL_HTTP,
				chainId: String(chainId),
			});
			provider = portis.provider;
		} else if (wallet === "MEW" && isBrowser()) {
			console.log("loading mew");
			// @ts-ignore
			const MEWconnect = (await import("@myetherwallet/mewconnect-web-client"))
				.default;
			console.log("mew loaded");
			console.log(MEWconnect);

			const mewConnect = new MEWconnect.Provider({
				chainId: chainId,
				// infuraId: INFURA_ID,
				rpcUrl: RPC_URL_HTTP,
			});
			console.log("mew connected");
			provider = mewConnect.makeWeb3Provider();
			console.log("mew provider made");
		}
		await provider.enable();
		console.log("ggg");

		const web3 = new Web3(provider);

		const accounts = await web3.eth.getAccounts();
		const _chainId = await web3.eth.getChainId();
		console.log(accounts);

		provider.on("accountsChanged", (accounts: string[]) => {
			console.log("account changed", accounts);
			alert("Account changed");
			window.location.reload();
		});

		// Subscribe to chainId change
		provider.on("chainChanged", async (chainId: string) => {
			console.log("chain changed to", parseInt(chainId));
			window.location.reload();
		});

		localStorage.setItem("walletName", wallet);

		console.log("connected to wallet", {
			web3,
			provider,
			account: accounts[0],
			currentNetworkId: _chainId,
			walletName: wallet,
		});

		return {
			web3,
			provider,
			account: accounts[0],
			currentNetworkId: _chainId,
			walletName: wallet,
		};
	} catch (err) {
		console.log("wallet connect error", err);
		return null;
	}
};
export default connect;

export const switchNetwork = async (
	w3: Iw3,
	_chainId?: number,
	afterNetworkAdd?: true
) => {
	const web3 = w3.web3;
	const chainId = _chainId || w3.selectedNetworkId;
	console.log("switching network to", chainId);
	if (!web3) {
		console.log("web3 is not ready to switch network");
		return;
	}
	try {
		// @ts-ignore
		await web3.currentProvider.request({
			method: "wallet_switchEthereumChain",
			params: [{ chainId: web3.utils.toHex(chainId) }],
		});
		return true;
	} catch (err: any) {
		console.log(err);
		if (!afterNetworkAdd && err.code === 4902) {
			try {
				await addNetwork(w3);
				await switchNetwork(w3, chainId, true);
			} catch (err) {
				console.log(err);
				return false;
			}
		}
		return false;
	}
};

const addNetwork = async (w3: Iw3) => {
	const web3 = w3.web3;
	const chainId = w3.selectedNetworkId;
	if (!web3) return;
	let chainName = chainId === 4 ? "Rinkeby" : "BSC Testnet";
	let nativeCurrency = {
		name: chainId === 4 ? "ETH" : "TBNB",
		symbol: chainId === 4 ? "ETH" : "TBNB",
		decimals: 18,
	};
	let rpcUrl =
		chainId === 4
			? "https://rinkeby.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
			: "https://data-seed-prebsc-1-s1.binance.org:8545/";
	let blockExplorer =
		chainId === 4
			? "https://rinkey.etherscan.io"
			: "https://testnet.bscscan.com/";

	await w3.provider.request({
		method: "wallet_addEthereumChain",
		params: [
			{
				chainId: web3.utils.toHex(chainId),
				chainName,
				nativeCurrency,
				rpcUrls: [rpcUrl],
				blockExplorerUrls: [blockExplorer],
			},
		],
	});
};

export const getContracts = (web3: Web3, chainId: number) => {
	console.log("getting contracts on chain", chainId);
	const DAI_ADDRESS =
		chainId === 4 ? config.RINKEBY_DAI_ADDRESS : config.TBSC_DAI_ADDRESS;
	const HB_ADDRESS =
		chainId === 4
			? process.env.NEXT_PUBLIC_HB_ADDRESS_RINKEBY
			: process.env.NEXT_PUBLIC_HB_ADDRESS_BSC_TESTNET;

	// @ts-ignore
	const Dai = new web3.eth.Contract(ERC20.abi, DAI_ADDRESS);
	// @ts-ignore
	const Hb = new web3.eth.Contract(HB.abi, HB_ADDRESS);
	// @ts-ignore

	// bridges
	const RPC_URL_RINKEBY =
		config.RINKEBY_RPC_URL + process.env.NEXT_PUBLIC_INFURA_RINEKBY_ID;
	const RPC_URL_BSC_TESTNET = config.TBSC_RPC_URL.replace(
		"__KEY__",
		process.env.NEXT_PUBLIC_MORALIS_KEY || ""
	);
	const BRIDGE_ADDRESS_RINKEBY = process.env.NEXT_PUBLIC_BRIDGE_ADDRESS_RINKEBY;
	const BRIDGE_ADDRESS_BSC_TESTNET =
		process.env.NEXT_PUBLIC_BRIDGE_ADDRESS_BSC_TESTNET;
	let BridgeRinkeby, BridgeBscTestnet;

	const _provider = new Web3.providers.WebsocketProvider(
		chainId !== 4 ? RPC_URL_RINKEBY : RPC_URL_BSC_TESTNET
	);
	const _web3 = new Web3(_provider);
	BridgeRinkeby = new (chainId === 4 ? web3 : _web3).eth.Contract(
		// @ts-ignore
		Bridge.abi,
		BRIDGE_ADDRESS_RINKEBY
	);
	BridgeBscTestnet = new (chainId === 97 ? web3 : _web3).eth.Contract(
		// @ts-ignore
		Bridge.abi,
		BRIDGE_ADDRESS_BSC_TESTNET
	);

	return {
		Dai,
		Hb,
		BridgeRinkeby,
		BridgeBscTestnet,
	};
};

export const getContractData = async (
	dai: any,
	hb: any,
	address: string,
	chainId: number
) => {
	console.log("getting contracts data on chain", chainId);
	const HB_ADDRESS =
		chainId === 4
			? process.env.NEXT_PUBLIC_HB_ADDRESS_RINKEBY
			: process.env.NEXT_PUBLIC_HB_ADDRESS_BSC_TESTNET;

	const _daiBalance = dai.methods.balanceOf(address).call();
	const _isApproved = dai.methods.allowance(address, HB_ADDRESS).call();
	const _hbBalance = hb.methods.balanceOf(address).call();
	const _hbSupply = hb.methods.totalSupply().call();

	const res = await Promise.all([
		_daiBalance,
		_hbBalance,
		_hbSupply,
		_isApproved,
	]);

	console.log("contract data", {
		balanceDai: res[0],
		balanceHb: res[1],
		totalSupply: res[2],
		isApproved: parseFloat(res[3]) > 0,
	});

	return {
		balanceDai: res[0],
		balanceHb: res[1],
		totalSupply: res[2],
		isApproved: parseFloat(res[3]) > 0,
	};
};

export const approveDai = async (
	dai: any,
	address: string,
	chainId: number
) => {
	try {
		const HB_ADDRESS =
			chainId === 4
				? process.env.NEXT_PUBLIC_HB_ADDRESS_RINKEBY
				: process.env.NEXT_PUBLIC_HB_ADDRESS_BSC_TESTNET;
		console.log("approving");
		const tx = await dai.methods
			.approve(
				HB_ADDRESS,
				"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
			)
			.send({
				from: address,
			});

		console.log("TX", tx);
		return true;
	} catch (err) {
		console.log("Approve failed", err);
		return false;
	}
};
//buy
export const mint = async (
	web3: Web3,
	hb: any,
	address: string,
	value: number | string
) => {
	try {
		const wei = web3.utils.toWei(value.toString(), "ether");
		const tx = await hb.methods.buy(wei).send({ from: address });
		console.log(tx);
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
};
// sell
export const sell = async (
	web3: Web3,
	hb: any,
	address: string,
	value: number | string
) => {
	try {
		const wei = web3.utils.toWei(value.toString(), "ether");
		const tx = await hb.methods.sell(wei).send({ from: address });
		console.log(tx);
		return true;
	} catch (err) {
		console.log("Swap error", err);
		return false;
	}
};

export const formatEth = (value: string) => {
	return parseFloat(Web3.utils.fromWei(value)).toFixed(2);
};

export const bridgeStep1 = async (
	w3: Iw3,
	bridge: any,
	amount: number,
	toChainId: number
) => {
	console.log(bridge, amount, toChainId);
	try {
		const tx = await bridge.methods
			.burn(Web3.utils.toWei(amount.toString(), "ether"), toChainId)
			.send({
				from: w3.account,
			});
		const returnValues = {
			nonce: parseInt(tx.events.Burn.returnValues.nonce),
			amount: tx.events.Burn.returnValues.amount as string,
			by: tx.events.Burn.returnValues.by as string,
			fromChainId: w3.currentNetworkId as number,
		};
		localStorage.setItem(
			`${w3.account}:pendingBridgeTx`,
			JSON.stringify(returnValues)
		);
		return returnValues;
	} catch (err) {
		console.log("Error while bridge step 1:", err);
		return null;
	}
};

export const bridgeStep2 = async (
	w3: Iw3,
	bridge: any,
	nonce: number,
	fromChainId: number
) => {
	try {
		const tx = await bridge.methods.mint(nonce, fromChainId).send({
			from: w3.account,
		});
		console.log(tx);
		localStorage.removeItem(`${w3.account}:pendingBridgeTx`);
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
};
