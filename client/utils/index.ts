import config from "../config.json";
import { IBridge, IPendingBridgeTx } from "../store";

export const isBrowser = () => typeof window !== "undefined";

export const getSelectedNetworkId = () => {
	if (isBrowser()) {
		let id = parseInt(localStorage.getItem("selectedNetworkId") || "");
		id = isNaN(id) ? config.CHAIN_IDS[0] : id;
		return id;
	}
	return config.CHAIN_IDS[0];
};

export const getBridge = (account: string | null): IBridge => {
	let pendingBridgeTx = null;

	try {
		if (account) {
			let _pendingBridgeTx = JSON.parse(
				localStorage.getItem(`${account}:pendingBridgeTx`) || ""
			) as IPendingBridgeTx;

			if (_pendingBridgeTx.by === account) {
				pendingBridgeTx = _pendingBridgeTx;
			}
			console.log("pendingBridgeTx", _pendingBridgeTx);
		} else {
			console.log("account is null when retrieving pendingBridgeTx");
		}
	} catch (err) {}

	return {
		chainRoute: [config.CHAIN_IDS[0], config.CHAIN_IDS[1]],
		currentStep: pendingBridgeTx ? 1 : 0,
		tokenAmount: 1,
		pendingBridgeTransaction: pendingBridgeTx,
		loading: account ? false : true,
		pendingTransactions: null,
	};
};
