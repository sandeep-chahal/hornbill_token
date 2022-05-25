import { useState } from "react";
import Image from "next/image";
import { useStore } from "../../store";
import config from "../../config.json";
import { bridgeStep1, switchNetwork, bridgeStep2 } from "../../utils/connect";
import Step1 from "./Step1";
import Step2 from "./Step2";
import PendingTransaction from "./PendingTransactions";

const Bridge = () => {
	const { w3, bridge, setBridge, transaction, setTransaction } = useStore();
	const [showPendingTx, setShowPendingTx] = useState(false);

	const handleStep1 = async () => {
		if (bridge.loading) return;
		setBridge({
			...bridge,
			loading: true,
		});
		if (w3.currentNetworkId === bridge.chainRoute[0]) {
			setTransaction({
				name: "Sending HornBill",
				type: "LOADING",
			});
			const result = await bridgeStep1(
				w3,
				bridge.chainRoute[0] === 4 ? w3.bridgeRinkeby : w3.bridgeBscTestnet,
				bridge.tokenAmount,
				bridge.chainRoute[1]
			);
			if (result) {
				setBridge({
					...bridge,
					currentStep: 1,
					pendingBridgeTransaction: result,
				});
				setTransaction({
					name: "Sent Successfully",
					type: "SUCCESS",
				});
			} else {
				// failed tx
				setBridge({
					...bridge,
					loading: false,
				});
				setTransaction({
					name: "Something went wrong",
					type: "FAILED",
				});
			}
		} else {
			// switch network
			handleSwitchNetwork(bridge.chainRoute[0]);
		}
	};

	const handleSwitchNetwork = async (toChainId: number) => {
		setTransaction({
			name: "Switching Network",
			type: "LOADING",
		});
		const result = await switchNetwork(w3, toChainId);
		if (result) {
			setTransaction({
				name: "Network Switched",
				type: "SUCCESS",
			});
			setBridge({
				...bridge,
				loading: false,
			});
			localStorage.setItem("selectedNetworkId", toChainId.toString());
		} else {
			setTransaction({
				name: "Something went wrong",
				type: "FAILED",
			});
		}
	};
	const setTokenAmount = (amount: number) => {
		setBridge({ ...bridge, tokenAmount: amount });
	};
	const alterChainRoute = () => {
		setBridge({
			...bridge,
			chainRoute: [bridge.chainRoute[1], bridge.chainRoute[0]],
		});
	};

	const handleStep2 = async () => {
		// if already loading or no pending transaction
		if (bridge.loading || !bridge.pendingBridgeTransaction) return;
		// if wrong network
		if (bridge.pendingBridgeTransaction.fromChainId === w3.currentNetworkId) {
			handleSwitchNetwork(
				bridge.pendingBridgeTransaction.fromChainId === 4 ? 97 : 4
			);
			return;
		} else {
			// if correct network then mint new tokens
			setBridge({
				...bridge,
				loading: true,
			});
			setTransaction({
				name: "Sending HornBill",
				type: "LOADING",
			});
			const result = await bridgeStep2(
				w3,
				w3.currentNetworkId === 4 ? w3.bridgeRinkeby : w3.bridgeBscTestnet,
				bridge.pendingBridgeTransaction.nonce,
				bridge.pendingBridgeTransaction.fromChainId
			);
			if (result) {
				setBridge({
					...bridge,
					currentStep: 0,
					pendingBridgeTransaction: null,
				});
				setTransaction({
					name: "You will shortly receive your tokens",
					type: "SUCCESS",
				});
			} else {
				// failed tx
				setBridge({
					...bridge,
					loading: false,
				});
				setTransaction({
					name: "Something went wrong",
					type: "FAILED",
				});
			}
		}
	};

	return (
		<div className="bridge">
			{showPendingTx && w3.account ? (
				<PendingTransaction
					bridge={bridge}
					setBridge={setBridge}
					account={w3.account}
					setShowPendingTx={setShowPendingTx}
				/>
			) : (
				<>
					<div className="steps">
						<div className={`step ${bridge.currentStep === 0 ? "active" : ""}`}>
							1
						</div>
						<div className={`step ${bridge.currentStep === 1 ? "active" : ""}`}>
							2
						</div>
					</div>

					{/* step 1 */}
					{bridge.currentStep === 0 && (
						<Step1
							alterChainRoute={alterChainRoute}
							bridge={bridge}
							setTokenAmount={setTokenAmount}
							handleStep1={handleStep1}
							w3={w3}
							setShowPendingTx={setShowPendingTx}
						/>
					)}
					{bridge.currentStep === 1 && bridge.pendingBridgeTransaction && (
						<Step2 bridge={bridge} w3={w3} handleStep2={handleStep2} />
					)}
				</>
			)}
		</div>
	);
};

export default Bridge;
