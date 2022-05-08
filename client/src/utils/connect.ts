import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import { Contract } from "web3-eth-contract";

import ERC20 from "../../contracts/ERC20.json";
import HB from "../../contracts/HornBill.json";

const RPC_URL = import.meta.env["VITE_APP_RPC_URL"];
const CHAIN_ID = Number(import.meta.env["VITE_APP_CHAIN_ID"]);
const INFURA_ID = import.meta.env["VITE_APP_INFURA_ID"];
const DAI_ADDRESS = import.meta.env["VITE_APP_DAI_ADDRESS"];
const HB_ADDRESS = import.meta.env["VITE_APP_HB_ADDRESS"];

export default async (wallet: string | null) => {
	if (wallet === null) return null;
	console.log("connecting using", wallet);

	let provider: any = null;

	if (wallet === "METAMASK") {
		provider = window.ethereum;
	} else if (wallet === "COINBASE") {
		const coinbaseWallet = new CoinbaseWalletSDK({
			appName: "HornBill Token",
			appLogoUrl: window.location.host + "/hornbill.jpg",
		});
		provider = coinbaseWallet.makeWeb3Provider(RPC_URL, CHAIN_ID);
	} else if (wallet === "WALLETCONNECT") {
		provider = new WalletConnectProvider({
			chainId: CHAIN_ID,
			infuraId: INFURA_ID,
		});
	}
	await provider.enable();
	const web3 = new Web3(provider);

	const accounts = await web3.eth.getAccounts();
	const chainId = await web3.eth.getChainId();

	provider.on("accountsChanged", (accounts: string[]) => {
		console.log(accounts);
		window.location.reload();
	});

	// Subscribe to chainId change
	provider.on("chainChanged", (chainId: number) => {
		console.log(chainId);
		window.location.reload();
	});

	// Subscribe to session disconnection
	provider.on("disconnect", (code: number, reason: string) => {
		console.log(code, reason);
		window.location.reload();
	});

	localStorage.setItem("walletName", wallet);

	return {
		web3,
		provider,
		account: accounts[0],
		networkId: chainId,
	};
};

export const switchNetwork = async (web3: Web3) => {
	// @ts-ignore
	await web3.currentProvider.request({
		method: "wallet_switchEthereumChain",
		params: [{ chainId: web3.utils.toHex(CHAIN_ID) }],
	});
};

export const getContract = (web3: Web3) => {
	// @ts-ignore
	const Dai = new web3.eth.Contract(ERC20.abi, DAI_ADDRESS);
	// @ts-ignore
	const Hb = new web3.eth.Contract(HB.abi, HB_ADDRESS);

	return {
		Dai,
		Hb,
	};
};

export const getContractData = async (
	dai: Contract,
	hb: Contract,
	address: string
) => {
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

	console.log(res);

	return {
		balanceDai: res[0],
		balanceHb: res[1],
		totalSupply: res[2],
		isApproved: parseFloat(res[3]) > 0,
	};
};

export const approveDai = async (dai: Contract, address: string) => {
	try {
		const tx = await dai.methods
			.approve(
				HB_ADDRESS,
				"0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
			)
			.send({ from: address });

		console.log(tx);
		return true;
	} catch (err) {
		console.log(err);

		return false;
	}
};
//buy
export const mint = async (
	web3: Web3,
	hb: Contract,
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
	hb: Contract,
	address: string,
	value: number | string
) => {
	try {
		const wei = web3.utils.toWei(value.toString(), "ether");
		const tx = await hb.methods.sell(wei).send({ from: address });
		console.log(tx);
		return true;
	} catch (err) {
		console.log(err);
		return false;
	}
};

export const formatEth = (value: string) => {
	return parseFloat(Web3.utils.fromWei(value)).toFixed(2);
};
