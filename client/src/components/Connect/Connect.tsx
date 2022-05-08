import "./connect.css";

import { useStore } from "../../store";

const CHAIN_ID = Number(import.meta.env.VITE_APP_CHAIN_ID);
import {
	switchNetwork,
	approveDai,
	mint,
	sell,
	getContractData,
	formatEth,
} from "../../utils/connect";
type ROUTE = {
	name: string;
	img: string;
};

interface IProps {
	route: ROUTE[];
}

const Connect = ({ route }: IProps) => {
	const { toggleWalletPopup, w3, setW3 } = useStore();

	const handleButtonClick = async () => {
		if (w3.loading) return;
		if (!w3.web3 || !w3.account) return toggleWalletPopup();
		setW3({ ...w3, loading: true });
		if (w3.networkId !== CHAIN_ID) {
			await switchNetwork(w3.web3);
			setW3({ ...w3, loading: false });
		}
		if (!w3.isApproved && w3.dai) {
			const isApproved = await approveDai(w3.dai, w3.account);
			if (isApproved) {
				setW3({ ...w3, isApproved, loading: false });
			}
		}
		handleBuySell();
	};

	const handleBuySell = async () => {
		if (!w3.isApproved || !w3.hb || !w3.dai || !w3.account || !w3.web3) return;
		let result = null;
		if (route[0].name === "Dai")
			result = await mint(w3.web3, w3.hb, w3.account, "1");
		else result = await sell(w3.web3, w3.hb, w3.account, "1");
		if (!result) {
			setW3({ ...w3, loading: false });
			return;
		}
		const data = await getContractData(w3.dai, w3.hb, w3.account);
		let totalSupply: string = formatEth(data.totalSupply);
		let balanceDAI: string = formatEth(data.balanceDai);
		let balanceHORNBILL: string = formatEth(data.balanceHb);
		console.log("new data", totalSupply);

		setW3({
			...w3,
			totalSupply,
			balanceDAI,
			balanceHORNBILL,
			loading: false,
		});
	};

	const getButtonText = () => {
		if (w3.loading) return "Wait";
		if (!w3.web3 || !w3.account) return "Connect";
		if (w3.networkId !== CHAIN_ID) return "Switch Network";
		if (!w3.isApproved) return "Approve Dai";
		return "Swap";
	};

	return (
		<button onClick={handleButtonClick} className="connect-button">
			{getButtonText()}
		</button>
	);
};

export default Connect;
