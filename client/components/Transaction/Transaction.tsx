import { ITransaction } from "../../store";

const Transaction = ({ transaction }: { transaction: ITransaction }) => {
	return (
		<div className="transaction">
			{transaction.type === "LOADING" && <div className="loader" />}
			{transaction.type === "FAILED" && <div className="failed" />}
			{transaction.type === "SUCCESS" && <div className="success" />}
			<h2>{transaction.name}</h2>
			{transaction.type === "LOADING" && (
				<p>Confirm the transaction from your wallet</p>
			)}
			{transaction.type === "FAILED" && (
				<p>Check your wallet for failed transaction</p>
			)}
			{transaction.type === "SUCCESS" && <p>Transaction successful</p>}
		</div>
	);
};

export default Transaction;
