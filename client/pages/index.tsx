import { useEffect, useState } from "react";
// import "./App.module.css";
import Sound from "react-sound";
import Wallets from "../components/Wallets/Wallets";

import Exchange from "../components/Exchange/Exchange";
import { useStore } from "../store";
import Modal from "../components/modal/modal";
import Transaction from "../components/Transaction/Transaction";
import { isBrowser } from "../utils";

const char = (char: string) => <span className="char">{char}</span>;

function App() {
	const {
		w3,
		walletPopupOpened,
		toggleWalletPopup,
		handleConnect,
		transaction,
		setTransaction,
	} = useStore();

	// @ts-ignore
	const isChromium = isBrowser() && window.chrome ? true : false;
	const hasMutedBefore =
		isBrowser() && localStorage.getItem("muted") === "true";

	const [soundPlaying, setSoundPlaying] = useState(
		!isChromium && !hasMutedBefore
	);

	const toggleSound = () => {
		if (isChromium) {
			document.removeEventListener("click", toggleSound);
		}
		localStorage.setItem("muted", JSON.stringify(soundPlaying));
		setSoundPlaying(!soundPlaying);
	};

	useEffect(() => {
		if (isChromium && !hasMutedBefore) {
			document.addEventListener("click", toggleSound);
		}
		return () => {
			if (isChromium) {
				document.removeEventListener("click", toggleSound);
			}
		};
	}, []);

	return (
		<div className="app">
			<div className="container">
				<div className="head">
					<h1>HornBill</h1>
					<p>
						HornBill is a new ERC20 token that is pegged to the dai stablecoin
						{char(".")} It is named after the Hornbill bird{char(",")} which is
						known for its large beak
						{char(".")} This token is intended to be used for comedic purposes
						and has no real world use case{char(".")}
					</p>
				</div>
			</div>
			<Exchange soundPlaying={soundPlaying} toggleSound={toggleSound} />
			<Sound
				url="../bg_sound.wav"
				playStatus={soundPlaying ? "PLAYING" : "STOPPED"}
				loop={true}
				autoLoad={true}
			/>
			{walletPopupOpened && (
				<Modal header="Wallets" onClose={toggleWalletPopup}>
					<Wallets handleConnect={handleConnect} />
				</Modal>
			)}
			{transaction && (
				<Modal header="Transaction" onClose={() => setTransaction(null)}>
					<Transaction transaction={transaction} />
				</Modal>
			)}
		</div>
	);
}

export default App;
