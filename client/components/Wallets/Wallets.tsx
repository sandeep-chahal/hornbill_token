import React, { useState } from "react";
import Image from "next/image";
import { useStore } from "../../store";

const Wallets = () => {
	const { w3, handleNetworkChange, handleConnect } = useStore();

	const _handleNetworkChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const id = parseInt(event.target.value);
		handleNetworkChange(id);
	};

	return (
		<>
			<div className="networks">
				<div className="network">
					<input
						type="radio"
						id="rinkeby"
						name="rinkeby"
						value={4}
						checked={w3.selectedNetworkId === 4}
						onChange={_handleNetworkChange}
					/>
					<label htmlFor="rinkeby">Rinkeby</label>
				</div>

				<div className="network">
					<input
						type="radio"
						id="BSC"
						name="BSC"
						value={97}
						checked={w3.selectedNetworkId === 97}
						onChange={_handleNetworkChange}
					/>
					<label htmlFor="BSC">BSC Testnet</label>
				</div>
			</div>
			<ul className="wallets">
				<li onClick={() => handleConnect("METAMASK", 4)}>
					<Image
						className="logo"
						width={25}
						height={25}
						src={"/metamask.svg"}
						alt="MetaMask"
					/>
					<h3>MetaMask</h3>
				</li>
				<li onClick={() => handleConnect("WALLETCONNECT", 4)}>
					<Image
						className="logo"
						width={25}
						height={25}
						src="https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/492d95c038bbcde1517cab5fb90ed4514690e919/svg/original/walletconnect-logo.svg"
						alt="Wallet Connect"
					/>
					<h3>Wallet Connect</h3>
				</li>
				<li onClick={() => handleConnect("COINBASE", 4)}>
					<Image
						className="logo"
						width={25}
						height={25}
						src="/coinbase.svg"
						alt="Coinbase"
					/>
					<h3>Coinbase</h3>
				</li>
				<li onClick={() => handleConnect("PORTIS", 4)}>
					<Image
						className="logo"
						width={25}
						height={25}
						src="/portis.png"
						alt="Portis"
					/>
					<h3>Portis</h3>
				</li>
				<li onClick={() => handleConnect("MEW", 4)}>
					<Image
						className="logo"
						width={25}
						height={25}
						src="/mew.png"
						alt="MEW"
					/>
					<h3>My Ether Wallet</h3>
				</li>
			</ul>
		</>
	);
};

export default Wallets;
