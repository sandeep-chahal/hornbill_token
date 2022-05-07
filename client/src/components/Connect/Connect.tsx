import "./connect.css";

import { useStore } from "../../store";

const CHAIN_ID = Number(import.meta.env.VITE_APP_CHAIN_ID);
import {
	switchNetwork,
	approveDai,
	mint,
	getContractData,
} from "../../utils/connect";

const Connect = () => {
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
		if (w3.isApproved && w3.hb && w3.dai) {
			const success = await mint(w3.web3, w3.hb, w3.account, "1");
			if (success) {
				const data = await getContractData(w3.dai, w3.hb, w3.account);
				let totalSupply: string = parseFloat(
					w3.web3.utils.fromWei(data.totalSupply)
				).toFixed(2);
				let balanceDAI: string = parseFloat(
					w3.web3.utils.fromWei(data.balanceDai)
				).toFixed(2);
				let balanceHORNBILL: string = parseFloat(
					w3.web3.utils.fromWei(data.balanceHb)
				).toFixed(2);
				console.log("new data", totalSupply);

				setW3({
					...w3,
					totalSupply,
					balanceDAI,
					balanceHORNBILL,
				});
			}
		}
		setW3({ ...w3, loading: false });
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
