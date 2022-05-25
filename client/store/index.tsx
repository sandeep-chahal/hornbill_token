import {
	createContext,
	useContext,
	ReactComponentElement,
	useState,
	useEffect,
	useRef,
} from "react";

import Web3 from "web3";

import connect, {
	getContracts,
	switchNetwork,
	getContractData,
	formatEth,
} from "../utils/connect";
import { isBrowser, getSelectedNetworkId, getBridge } from "../utils";
import config from "../config.json";

export interface Iw3 {
	web3: Web3 | null;
	provider: any;
	account: string | null;
	currentNetworkId: number | null;
	selectedNetworkId: number;
	balanceDAI: string | null;
	balanceHORNBILL: string | null;
	dai: any;
	hb: any;
	bridgeRinkeby: any;
	bridgeBscTestnet: any;
	totalSupply: string | null;
	loading: boolean;
	isApproved: boolean;
	walletName: string | null;
}

export type IPendingBridgeTx = {
	amount: string;
	nonce: string;
	fromChainId: number;
	by: string;
};

export interface IBridge {
	chainRoute: number[];
	currentStep: number;
	tokenAmount: number;
	pendingBridgeTransaction: IPendingBridgeTx | null;
	loading: boolean;
	pendingTransactions: IPendingBridgeTx[] | null;
}

interface IContext {
	w3: Iw3;
	setW3: (w3: Iw3) => void;
	walletPopupOpened: boolean;
	toggleWalletPopup: () => void;
	handleConnect: (w: string | null, chainId: number | null) => void;
	transaction: ITransaction | null;
	setTransaction: (transaction: ITransaction | null) => void;
	handleNetworkChange: (c: number) => void;
	bridge: IBridge;
	setBridge: (bridge: IBridge) => void;
}
export interface ITransaction {
	name: string;
	type: "LOADING" | "FAILED" | "SUCCESS";
	tx?: any;
}

const Context = createContext<IContext>({
	w3: {
		web3: null,
		provider: null,
		account: null,
		currentNetworkId: null,
		selectedNetworkId: getSelectedNetworkId(),
		balanceDAI: null,
		balanceHORNBILL: null,
		dai: null,
		hb: null,
		totalSupply: null,
		loading: false,
		isApproved: false,
		walletName: null,
		bridgeRinkeby: null,
		bridgeBscTestnet: null,
	},
	setW3: () => {},
	walletPopupOpened: false,
	toggleWalletPopup: () => {},
	handleConnect: (w: string | null, chainId: number | null) => {},
	transaction: null,
	setTransaction: (tx: ITransaction | null) => {},
	handleNetworkChange: (c: number) => {},
	setBridge: (b: IBridge) => {},
	bridge: {
		chainRoute: [config.CHAIN_IDS[0], config.CHAIN_IDS[1]],
		currentStep: 0,
		tokenAmount: 1,
		pendingBridgeTransaction: null,
		loading: true,
		pendingTransactions: null,
	},
});

const Provider = ({ children }: { children: ReactComponentElement<any> }) => {
	const [w3, setW3] = useState<Iw3>({
		web3: null,
		provider: null,
		account: null,
		balanceDAI: null,
		balanceHORNBILL: null,
		dai: null,
		hb: null,
		totalSupply: null,
		loading: false,
		isApproved: false,
		walletName: isBrowser() ? localStorage.getItem("walletName") : null,
		selectedNetworkId: getSelectedNetworkId(),
		currentNetworkId: null,
		bridgeRinkeby: null,
		bridgeBscTestnet: null,
	});
	const [walletPopup, setWalletPopup] = useState(false);
	const hasMounted = useRef(false); //prevents calling useEffect twice
	const [transaction, setTransaction] = useState<ITransaction | null>(null);
	const [bridge, setBridge] = useState<IBridge>({
		chainRoute: [config.CHAIN_IDS[0], config.CHAIN_IDS[1]],
		currentStep: 0,
		tokenAmount: 1,
		pendingBridgeTransaction: null,
		loading: true,
		pendingTransactions: null,
	});

	const handleConnect = async (w: string | null, chainId: number | null) => {
		setWalletPopup(false);
		setW3((w) => ({ ...w, loading: true }));
		const res = await connect(w, chainId);
		if (res === null) {
			setW3((w) => ({ ...w, loading: false }));
			console.log("Error connecting to wallet");
			return;
		}
		let dai: any = null;
		let hb: any = null;
		let bridgeBscTestnet: any = null;
		let bridgeRinkeby: any = null;
		let totalSupply: string | null = null;
		let balanceDAI: string | null = null;
		let balanceHORNBILL: string | null = null;
		let isApproved: boolean = false;
		if (
			res.web3 &&
			res.currentNetworkId === w3.selectedNetworkId &&
			res.account
		) {
			const { Dai, Hb, BridgeBscTestnet, BridgeRinkeby } = await getContracts(
				res.web3,
				res.currentNetworkId
			);

			const data = await getContractData(
				Dai,
				Hb,
				res.account,
				res.currentNetworkId
			);

			isApproved = data.isApproved;
			dai = Dai;
			hb = Hb;
			bridgeBscTestnet = BridgeBscTestnet;
			bridgeRinkeby = BridgeRinkeby;
			totalSupply = formatEth(data.totalSupply);
			balanceDAI = formatEth(data.balanceDai);
			balanceHORNBILL = formatEth(data.balanceHb);
		} else {
			console.log(
				"web3 not fully loaded",
				res,
				res.web3 &&
					res.currentNetworkId === w3.selectedNetworkId &&
					res.account,
				res.currentNetworkId,
				w3.selectedNetworkId
			);
		}
		setBridge(getBridge(res.account));
		setW3((w) => ({
			...w,
			...res,
			balanceDAI,
			balanceHORNBILL,
			dai,
			hb,
			bridgeRinkeby,
			bridgeBscTestnet,
			totalSupply,
			loading: false,
			isApproved: isApproved,
			walletName: res.walletName,
		}));
	};

	const handleNetworkChange = (networkId: number) => {
		setW3((w) => ({ ...w, selectedNetworkId: networkId }));
		localStorage.setItem("selectedNetworkId", networkId.toString());

		if (w3.currentNetworkId === networkId && !w3.dai && !w3.hb) {
			window.location.reload();
		}
	};

	useEffect(() => {
		if (!hasMounted.current) {
			hasMounted.current = true;
			console.log("Provider mounted");
			handleConnect(w3.walletName, w3.selectedNetworkId);
		}
	}, []);

	return (
		<Context.Provider
			value={{
				w3,
				setW3,
				walletPopupOpened: walletPopup,
				toggleWalletPopup: () => setWalletPopup(!walletPopup),
				handleConnect,
				transaction,
				setTransaction,
				handleNetworkChange,
				bridge,
				setBridge,
			}}
		>
			{children}
		</Context.Provider>
	);
};

export default Provider;

export const useStore = () => useContext(Context);
