import { useEffect } from "react";
import Web3 from "web3";
import { IBridge, IPendingBridgeTx } from "../../store";
import { getBridgePendingTxs } from "../../utils/connect";
interface IProps {
	bridge: IBridge;
	setBridge: (bridge: IBridge) => void;
	account: string;
	setShowPendingTx: (b: boolean) => void;
}
const PendingTransaction = ({
	bridge,
	setBridge,
	account,
	setShowPendingTx,
}: IProps) => {
	useEffect(() => {
		if (bridge.pendingTransactions === null) {
			// if not already loaded
			getBridgePendingTxs(account).then((txs) => {
				setBridge({ ...bridge, pendingTransactions: txs });
			});
		}
	}, []);

	const handleClaim = (tx: IPendingBridgeTx) => {
		setBridge({
			...bridge,
			currentStep: 1,
			pendingBridgeTransaction: { ...tx, by: account },
		});
		setShowPendingTx(false);
	};

	return (
		<div className="pending-transactions">
			<h2>Pending Transactions</h2>

			{bridge.pendingTransactions === null ? (
				<div className="pulsing-4" />
			) : (
				<>
					{bridge.pendingTransactions.length > 0 ? (
						<ul className="tx-list">
							{bridge.pendingTransactions.map((tx) => (
								<li key={tx.nonce + tx.fromChainId}>
									<div className="chain-route">
										<h3>
											From<span className="char">: </span>
											{tx.fromChainId === 4 ? "Rinkeby" : "Bsc Testnet"}
										</h3>
										<h3>
											To<span className="char">: </span>
											{tx.fromChainId === 4 ? "Bsc Testnet" : "Rinkeby"}
										</h3>
									</div>
									<p>
										Amount<span className="char">: </span>
										{Web3.utils.fromWei(tx.amount, "ether")}
									</p>
									<p>
										Nonce<span className="char">: </span>
										{tx.nonce}
									</p>
									<button onClick={() => handleClaim(tx)} className="button">
										Claim
									</button>
								</li>
							))}
						</ul>
					) : (
						<div className="error">No Pending Transactions</div>
					)}
				</>
			)}
		</div>
	);
};
export default PendingTransaction;
