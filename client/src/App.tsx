import { useEffect, useState } from "react";
import Sound from "react-sound";
import "./App.css";

import Exchange from "./components/Exchange";

const char = (char: string) => <span className="char">{char}</span>;

function App() {
	// @ts-ignore
	const isChromium = window.chrome ? true : false;
	const hasMutedBefore = localStorage.getItem("muted") === "true";

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
	}, [isChromium]);

	return (
		<div className="app">
			<div className="container">
				<div className="head">
					<h1>HornBill</h1>
					<p>
						HornBill is a new erc20 token that is pegged to the dai stablecoin
						{char(".")} It is named after the Hornbill bird{char(",")} which is
						known for its large beak
						{char(".")} This token is intended to be used for comedic purposes
						and has no real world use case{char(".")}
					</p>
				</div>
			</div>
			<Exchange soundPlaying={soundPlaying} toggleSound={toggleSound} />
			<Sound
				url="./bg_sound.wav"
				playStatus={soundPlaying ? "PLAYING" : "STOPPED"}
				loop={true}
				autoLoad={true}
			/>
		</div>
	);
}

export default App;
