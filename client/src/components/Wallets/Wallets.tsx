import { useState } from "react";
import { useStore } from "../../store";
import "./wallets.css";

const Wallets = () => {
	const { toggleWalletPopup, setW3, handleConnect } = useStore();

	return (
		<div className="wallets bg-overlay">
			<div className="box">
				<div className="title">
					<h2>Wallets</h2>
					<img
						onClick={toggleWalletPopup}
						src="./close.svg"
						width={20}
						height={20}
					/>
				</div>
				<ul>
					<li onClick={() => handleConnect("METAMASK")}>MetaMask</li>
					<li onClick={() => handleConnect("WALLETCONNECT")}>Wallet Connect</li>
					<li onClick={() => handleConnect("COINBASE")}>Coinbase</li>
				</ul>
			</div>
		</div>
	);
};

export default Wallets;
