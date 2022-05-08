import { useState } from "react";
import { useStore } from "../../store";
import "./wallets.css";

const Wallets = () => {
	const { toggleWalletPopup, setW3, handleConnect } = useStore();

	return (
		<ul className="wallets">
			<li onClick={() => handleConnect("METAMASK")}>MetaMask</li>
			<li onClick={() => handleConnect("WALLETCONNECT")}>Wallet Connect</li>
			<li onClick={() => handleConnect("COINBASE")}>Coinbase</li>
		</ul>
	);
};

export default Wallets;
