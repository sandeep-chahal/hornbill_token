import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

import Store from "../store";

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<title>HornBill Token</title>
				<meta
					name="description"
					content="HornBill is a new ERC20 token that is pegged to the dai stablecoin. It is named after the Hornbill bird, which is known for its large beak. This token is intended to be used for comedic purposes and has no real world use case."
				/>
				<meta name="keywords" content="hornbill, token,erc20, blockchain" />
				<meta name="author" content="Sandeep Chahal" />
				<meta name="google" content="notranslate" />

				<meta property="og:title" content="HornBill Token" />
				<meta
					property="og:description"
					content="HornBill is a new ERC20 token that is pegged to the dai stablecoin. It is named after the Hornbill bird, which is known for its large beak. This token is intended to be used for comedic purposes and has no real world use case."
				/>
				<meta property="og:image" content="/hornbill.jpg" />
				<meta property="og:url" content="https://hornbill-token.vercel.app" />
				<meta property="og:type" content="website" />
				<meta property="og:site_name" content="HornBill Token" />
			</Head>
			<Store>
				<Component {...pageProps} />
			</Store>
		</>
	);
}

export default MyApp;
