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
	getContract,
	switchNetwork,
	getContractData,
	formatEth,
} from "../utils/connect";
import { isBrowser } from "../utils";

const CHAIN_ID = Number(process.env["NEXT_PUBLIC_CHAIN_ID"]);

export interface Iw3 {
	web3: Web3 | null;
	provider: any;
	account: string | null;
	networkId: number | null;
	balanceDAI: string | null;
	balanceHORNBILL: string | null;
	dai: any;
	hb: any;
	totalSupply: string | null;
	loading: boolean;
	isApproved: boolean;
	walletName: string | null;
}

interface IContext {
	w3: Iw3;
	setW3: (w3: Iw3) => void;
	walletPopupOpened: boolean;
	toggleWalletPopup: () => void;
	handleConnect: (w: string | null) => void;
	transaction: ITransaction | null;
	setTransaction: (transaction: ITransaction | null) => void;
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
		networkId: null,
		balanceDAI: null,
		balanceHORNBILL: null,
		dai: null,
		hb: null,
		totalSupply: null,
		loading: false,
		isApproved: false,
		walletName: null,
	},
	setW3: () => {},
	walletPopupOpened: false,
	toggleWalletPopup: () => {},
	handleConnect: (w: string | null) => {},
	transaction: null,
	setTransaction: (tx: ITransaction | null) => {},
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
		walletName: isBrowser() ? localStorage.getItem("walletName") : null,
	});
	const [walletPopup, setWalletPopup] = useState(false);
	const hasMounted = useRef(false); //prevents calling useEffect twice
	const [transaction, setTransaction] = useState<ITransaction | null>(null);

	const handleConnect = async (w: string | null) => {
		setWalletPopup(false);
		const res = await connect(w);
		if (res === null) return;
		setW3((w) => ({ ...w, loading: true }));
		let dai: any = null;
		let hb: any = null;
		let totalSupply: string | null = null;
		let balanceDAI: string | null = null;
		let balanceHORNBILL: string | null = null;
		let isApproved: boolean = false;
		if (res.web3 && res.networkId === CHAIN_ID && res.account) {
			const { Dai, Hb } = await getContract(res.web3);

			const data = await getContractData(Dai, Hb, res.account);

			isApproved = data.isApproved;
			dai = Dai;
			hb = Hb;
			totalSupply = formatEth(data.totalSupply);
			balanceDAI = formatEth(data.balanceDai);
			balanceHORNBILL = formatEth(data.balanceHb);
		}
		setW3((w) => ({
			...w,
			...res,
			balanceDAI,
			balanceHORNBILL,
			dai,
			hb,
			totalSupply,
			loading: false,
			isApproved: isApproved,
			walletName: res.walletName,
		}));
	};

	useEffect(() => {
		if (!hasMounted.current) {
			hasMounted.current = true;
			console.log("Provider mounted");
			handleConnect(w3.walletName);
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
			}}
		>
			{children}
		</Context.Provider>
	);
};

export default Provider;

export const useStore = () => useContext(Context);
