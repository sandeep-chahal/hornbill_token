import { useStore } from "../../store";
import config from "../../config.json";

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
	const { toggleWalletPopup, w3, setW3, setTransaction, handleConnect } =
		useStore();

	const handleButtonClick = async () => {
		// if not connected to the wallet
		if (w3.loading) return;
		if (!w3.web3 || !w3.currentNetworkId) return toggleWalletPopup();
		if (!w3.account)
			return await handleConnect(w3.walletName, w3.currentNetworkId);

		// connected
		// if wrong network
		setW3({ ...w3, loading: true });
		if (w3.currentNetworkId !== w3.selectedNetworkId) {
			setTransaction({
				name: "Switching network",
				type: "LOADING",
			});
			const done = await switchNetwork(w3);
			setW3({ ...w3, loading: false });
			if (done) setTransaction(null);
			else setTransaction({ type: "FAILED", name: "Error switching network" });
			return;
		}
		// if dai not approved
		if (!w3.isApproved) {
			if (!w3.dai) {
				console.log("dai contract not initialized");
				return;
			}
			setTransaction({
				name: "Approving DAI",
				type: "LOADING",
			});
			const isApproved = await approveDai(
				w3.dai,
				w3.account,
				w3.currentNetworkId
			);
			// dai was approved
			if (isApproved) {
				setW3({ ...w3, isApproved, loading: false });
				setTransaction({
					name: "DAI Approved",
					type: "SUCCESS",
				});
			} else {
				// dai was not approved
				setW3({ ...w3, isApproved, loading: false });
				setTransaction({
					name: "DAI Approval Failed",
					type: "FAILED",
				});
			}
			return;
		}
		// everything is ready
		handleBuySell();
	};

	const handleBuySell = async () => {
		if (
			!w3.isApproved ||
			!w3.hb ||
			!w3.dai ||
			!w3.account ||
			!w3.web3 ||
			!w3.currentNetworkId
		) {
			console.log("something is not right");
			return;
		}
		setTransaction({
			name: "Swapping",
			type: "LOADING",
		});
		let result = null;
		if (route[0].name === "Dai")
			result = await mint(w3.web3, w3.hb, w3.account, "1");
		else result = await sell(w3.web3, w3.hb, w3.account, "1");
		if (!result) {
			setW3({ ...w3, loading: false });
			setTransaction({
				name: "Swapping Failed",
				type: "FAILED",
			});
			return;
		}
		const data = await getContractData(
			w3.dai,
			w3.hb,
			w3.account,
			w3.currentNetworkId
		);
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
		setTransaction({
			name: "Swapped",
			type: "SUCCESS",
		});
	};

	const getButtonText = () => {
		if (w3.loading) return "Wait";
		if (!w3.web3 || !w3.account || !w3.currentNetworkId) return "Connect";
		if (w3.currentNetworkId !== w3.selectedNetworkId)
			return `Switch To ${
				w3.selectedNetworkId === 4 ? "Rinkeby" : "BSC Testnet"
			}`;
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
