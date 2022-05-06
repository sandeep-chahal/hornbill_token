import { useState } from "react";
import "./App.css";
import Exchange from "./components/Exchange";

const char = (char: string) => <span className="char">{char}</span>;

function App() {
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
			<Exchange />
		</div>
	);
}

export default App;
