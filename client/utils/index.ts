import config from "../config.json";

export const isBrowser = () => typeof window !== "undefined";

export const getSelectedNetworkId = () => {
	if (isBrowser()) {
		let id = parseInt(localStorage.getItem("selectedNetworkId") || "");
		id = isNaN(id) ? config.CHAIN_IDS[0] : id;
		return id;
	}
	return config.CHAIN_IDS[0];
};
