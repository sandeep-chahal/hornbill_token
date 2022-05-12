import Image from "next/image";

const Wallets = ({ handleConnect }: { handleConnect: (w: string) => void }) => {
	return (
		<ul className="wallets">
			<li onClick={() => handleConnect("METAMASK")}>
				<Image
					className="logo"
					width={25}
					height={25}
					src={"/metamask.svg"}
					alt="MetaMask"
				/>
				<h3>MetaMask</h3>
			</li>
			<li onClick={() => handleConnect("WALLETCONNECT")}>
				<Image
					className="logo"
					width={25}
					height={25}
					src="https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/492d95c038bbcde1517cab5fb90ed4514690e919/svg/original/walletconnect-logo.svg"
					alt="Wallet Connect"
				/>
				<h3>Wallet Connect</h3>
			</li>
			<li onClick={() => handleConnect("COINBASE")}>
				<Image
					className="logo"
					width={25}
					height={25}
					src="/coinbase.svg"
					alt="Coinbase"
				/>
				<h3>Coinbase</h3>
			</li>
			<li onClick={() => handleConnect("PORTIS")}>
				<Image
					className="logo"
					width={25}
					height={25}
					src="/portis.png"
					alt="Portis"
				/>
				<h3>Portis</h3>
			</li>
		</ul>
	);
};

export default Wallets;
