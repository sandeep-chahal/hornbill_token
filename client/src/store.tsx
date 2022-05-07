import {
	createContext,
	useContext,
	ReactComponentElement,
	useState,
	useEffect,
} from "react";

import Web3 from "web3";
import { Contract } from "web3-eth-contract";

import connect, {
	getContract,
	switchNetwork,
	getContractData,
} from "./utils/connect";

const CHAIN_ID = Number(import.meta.env["VITE_APP_CHAIN_ID"]);

export interface Iw3 {
	web3: Web3 | null;
	provider: any;
	account: string | null;
	networkId: number | null;
	balanceDAI: string | null;
	balanceHORNBILL: string | null;
	dai: null | Contract;
	hb: null | Contract;
	totalSupply: string | null;
	loading: boolean;
	isApproved: boolean;
}

interface IContext {
	w3: Iw3;
	setW3: (w3: Iw3) => void;
	walletPopupOpened: boolean;
	toggleWalletPopup: () => void;
	handleConnect: (w: string) => void;
}

const Context = createContext<IContext>({
	w3: {
		web3: null,
		provider: null,
		account: null,
		networkId: null,
		balanceDAI: null,
		balanceHORNBILL: null,
		dai: null,
		hb: null,
		totalSupply: null,
		loading: false,
		isApproved: false,
	},
	setW3: () => {},
	walletPopupOpened: false,
	toggleWalletPopup: () => {},
	handleConnect: (w: string) => {},
});

const Provider = ({ children }: { children: ReactComponentElement<any> }) => {
	const [w3, setW3] = useState<Iw3>({
		web3: null,
		provider: null,
		account: null,
		networkId: null,
		balanceDAI: null,
		balanceHORNBILL: null,
		dai: null,
		hb: null,
		totalSupply: null,
		loading: false,
		isApproved: false,
	});
	const [walletPopup, setWalletPopup] = useState(false);

	const handleConnect = async (w: string | null) => {
		setWalletPopup(false);
		const res = await connect(w);
		if (res === null) return;
		setW3((w) => ({ ...w, loading: true }));
		let dai: Contract | null = null;
		let hb: Contract | null = null;
		let totalSupply: string | null = null;
		let balanceDAI: string | null = null;
		let balanceHORNBILL: string | null = null;
		let isApproved: boolean = false;
		if (res.web3 && res.networkId === CHAIN_ID) {
			const { Dai, Hb } = await getContract(res.web3);

			const data = await getContractData(Dai, Hb, res.account);

			isApproved = data.isApproved;
			dai = Dai;
			hb = Hb;
			totalSupply = parseFloat(
				res.web3.utils.fromWei(data.totalSupply)
			).toFixed(2);
			balanceDAI = parseFloat(res.web3.utils.fromWei(data.balanceDai)).toFixed(
				2
			);
			balanceHORNBILL = parseFloat(
				res.web3.utils.fromWei(data.balanceHb)
			).toFixed(2);
		}
		setW3((w) => ({
			...res,
			balanceDAI,
			balanceHORNBILL,
			dai,
			hb,
			totalSupply,
			loading: false,
			isApproved: isApproved,
		}));
	};

	useEffect(() => {
		handleConnect(null);
	}, []);

	return (
		<Context.Provider
			value={{
				w3,
				setW3,
				walletPopupOpened: walletPopup,
				toggleWalletPopup: () => setWalletPopup(!walletPopup),
				handleConnect: handleConnect,
			}}
		>
			{children}
		</Context.Provider>
	);
};

export default Provider;

export const useStore = () => useContext(Context);
