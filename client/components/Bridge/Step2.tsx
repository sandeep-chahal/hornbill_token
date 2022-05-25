interface IProps {
	bridge: any;
	w3: any;
	handleStep2: () => void;
}

const Step2 = ({ bridge, w3, handleStep2 }: IProps) => {
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

	return (
		<div className="step-2">
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
	);
};

export default Step2;
