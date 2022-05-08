import "./wallets.css";

const Wallets = ({ handleConnect }: { handleConnect: (w: string) => void }) => {
	return (
		<ul className="wallets">
			<li onClick={() => handleConnect("METAMASK")}>MetaMask</li>
			<li onClick={() => handleConnect("WALLETCONNECT")}>Wallet Connect</li>
			<li onClick={() => handleConnect("COINBASE")}>Coinbase</li>
		</ul>
	);
};

export default Wallets;
