import { IBridge, Iw3 } from "../../store";

interface IProps {
	setTokenAmount: (amount: number) => void;

	alterChainRoute: () => void;
	handleStep1: () => void;

	bridge: IBridge;

	w3: Iw3;
	setShowPendingTx: (t: boolean) => void;
}

const Step1 = ({
	bridge,
	alterChainRoute,
	handleStep1,
	setTokenAmount,
	w3,
	setShowPendingTx,
}: IProps) => {
	const getStep1ButtonText = () => {
		if (bridge.loading) return "Wait";
		if (w3.currentNetworkId === bridge.chainRoute[0])
			return `Send From ${
				bridge.chainRoute[0] === 4 ? "Rinkeby" : "BSC Testnet"
			}`;
		else return "Switch Network";
	};
	return (
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
					<span> {bridge.chainRoute[0] === 4 ? "Rinkeby" : "BSC Testnet"}</span>
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
					<span>{bridge.chainRoute[1] === 4 ? "Rinkeby" : "BSC Testnet"}</span>
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
			{w3.account && (
				<div
					onClick={() => w3.account && setShowPendingTx(true)}
					className="pending-tx-button"
				>
					Pending Transactions
				</div>
			)}
		</div>
	);
};

export default Step1;
