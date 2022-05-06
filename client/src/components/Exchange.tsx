import { useState } from "react";

import "./exchange.css";

const DAI = {
	name: "Dai",
	img: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
};
const HB = {
	name: "HornBill",
	img: "./hornbill.jpg",
};

const Exchange = () => {
	const [value, setValue] = useState<number>(1.0);
	const [route, setRoute] = useState([DAI, HB]);

	const onRouteChange = () => {
		setRoute((route) => [route[1], route[0]]);
	};

	const isMinting = route[0].name === "Dai" ? true : false;

	console.log(value);

	return (
		<div className="exchange">
			<div className="exchange-box">
				<h2>
					Mint<span className="char"> / </span>Burn
				</h2>
				<div className="container">
					<div className="from">
						<input
							type="number"
							value={value}
							onChange={(e) => setValue(parseFloat(e.target.value))}
						/>
						<div className="token">
							<img
								className="token-img"
								width={25}
								height={25}
								src={route[0].img}
							/>
							<h3 className="token-name">{route[0].name}</h3>
						</div>
					</div>
					<div className="arrow" onClick={onRouteChange}>
						<img
							className={`${!isMinting && "rot"}`}
							src="./arrow.svg"
							width={20}
							height={20}
						/>
					</div>
					<div className="to">
						<input
							type="number"
							value={value}
							onChange={(e) => setValue(parseFloat(e.target.value))}
						/>
						<div className="token">
							<img
								className="token-img"
								src={route[1].img}
								width={25}
								height={25}
							/>
							<h3 className="token-name">{route[1].name}</h3>
						</div>
					</div>
					<button className="button">Mint</button>
				</div>
				<div>
					<div className="meta">
						<div className="meta-flex">
							<h3>
								Total Supply <span className="char">/</span> Reserve
								<span className="char">:</span>
							</h3>
							<p className="char">1.2M</p>
						</div>
						<div className="meta-flex">
							<h3>
								Dai Balance<span className="char">:</span>
							</h3>
							<p className="char">10K</p>
						</div>
						<div className="meta-flex">
							<h3>
								HornBill Balance<span className="char">:</span>
							</h3>
							<p className="char">105</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Exchange;
