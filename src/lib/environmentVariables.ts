
const infuraURL = process.env.REACT_APP_INFURA_URL || "";
const infix = infuraURL[infuraURL.length - 1] === "/" ? "" : "/";

export const INFURA_URL = `${infuraURL}${infix}${process.env.REACT_APP_INFURA_KEY}`;
export const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;
export const NETWORK = process.env.REACT_APP_NETWORK;
export const ETH_NETWORK = process.env.REACT_APP_ETH_NETWORK;
export const ETH_NETWORK_LABEL = process.env.REACT_APP_ETH_NETWORK_LABEL;
export const SOURCE_VERSION = process.env.REACT_APP_SOURCE_VERSION;

export const environment = ((process.env.NODE_ENV === "development") ? "local" : NETWORK) || "unknown";

export const etherscan = `https://${ETH_NETWORK === "mainnet" ? "" : `${ETH_NETWORK}.`}etherscan.io`;
