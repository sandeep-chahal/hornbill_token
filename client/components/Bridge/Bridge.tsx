import { useState } from "react";
import Image from "next/image";
import { useStore } from "../../store";
import config from "../../config.json";
import { bridgeStep1, switchNetwork, bridgeStep2 } from "../../utils/connect";

interface IProps {}

const Bridge = () => {
	const { w3, bridge, setBridge, transaction, setTransaction } = useStore();

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

	const getStep1ButtonText = () => {
		if (bridge.loading) return "Wait";
		if (w3.currentNetworkId === bridge.chainRoute[0])
			return `Send From ${
				bridge.chainRoute[0] === 4 ? "Rinkeby" : "BSC Testnet"
			}`;
		else return "Switch Network";
	};

	const getStep2ButtonText = () => {
		if (bridge.loading) return "Wait";
		if (bridge.pendingBridgeTransaction?.fromChainId === w3.currentNetworkId) {
			return `Switch Network To ${
				w3.currentNetworkId === 4 ? "BSC Testnet" : "Rinkeby"
			}`;
		} else {
			return "Get Tokens";
		}
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
				<div className="step-1">
					{/* token amount */}
					<div>
						<h3>Token Amount</h3>
						<input
							type="number"
							className="token-amount"
							value={bridge.tokenAmount}
							onChange={(e) => {
								setTokenAmount(parseFloat(e.target.value));
								console.log(e.target.value);
							}}
						/>
					</div>

					{/* from */}
					<div className="chain">
						<h3>From</h3>
						<div className="chain-name">
							<img
								className="chain-icon"
								width={20}
								height={20}
								src={`${
									bridge.chainRoute[0] === 4 ? "/ethereum.svg" : "/binance.svg"
								}`}
								alt="chain logo"
							/>
							<span>
								{" "}
								{bridge.chainRoute[0] === 4 ? "Rinkeby" : "BSC Testnet"}
							</span>
						</div>
					</div>
					{/* exchange arrow */}
					<img
						src="/exchange-arrow.svg"
						width={20}
						height={20}
						className="exchange-arrow"
						alt="exchange arrow"
						onClick={() => {
							alterChainRoute();
						}}
					/>
					{/* to */}
					<div className="chain">
						<h3>To</h3>
						<div className="chain-name">
							<img
								className="chain-icon"
								width={20}
								height={20}
								src={`${
									bridge.chainRoute[1] === 4 ? "/ethereum.svg" : "/binance.svg"
								}`}
								alt="chain logo"
							/>
							<span>
								{bridge.chainRoute[1] === 4 ? "Rinkeby" : "BSC Testnet"}
							</span>
						</div>
					</div>
					{/* button */}
					<button
						disabled={bridge.loading || w3.account === null}
						className="button"
						onClick={handleStep1}
					>
						{getStep1ButtonText()}
					</button>
				</div>
			)}
			{bridge.currentStep === 1 && bridge.pendingBridgeTransaction && (
				<div className="step-2">
					{/* <div className="icons">
						<img
							width={20}
							height={20}
							src={`${
								bridge.pendingBridgeTransaction.fromChainId === 4
									? "/ethereum.svg"
									: "/binance.svg"
							}`}
						/>
						<img
							width={20}
							height={20}
							src={`${
								bridge.pendingBridgeTransaction.fromChainId === 4
									? "/binance.svg"
									: "/ethereum.svg"
							}`}
						/>
					</div> */}
					<ul className="steps">
						<li>
							1<span className="char">:</span> Switch to{" "}
							{bridge.pendingBridgeTransaction.fromChainId === 4
								? "BSC Testnet"
								: "Rinkeby"}
						</li>
						<li>
							2<span className="char">:</span> Click on Get Tokens button
						</li>
						<li>
							3<span className="char">:</span> Wait for a couple of seconds
						</li>
					</ul>
					<div className="info">
						Token Amount Available To Mint<span className="char">:</span>{" "}
						{w3.web3?.utils.fromWei(
							bridge.pendingBridgeTransaction.amount,
							"ether"
						)}
					</div>
					<button disabled={bridge.loading} onClick={handleStep2}>
						{getStep2ButtonText()}
					</button>
				</div>
			)}
		</div>
	);
};

export default Bridge;
