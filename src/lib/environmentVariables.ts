
export enum Network {
    Testnet = "testnet",
    Mainnet = "mainnet",
}

export enum EthNetwork {
    Kovan = "kovan",
    Mainnet = "main",
}

export const EthNetworkLabel = {
    [EthNetwork.Kovan]: "Kovan",
    [EthNetwork.Mainnet]: "Mainnet",
};

export const PUBLIC_NODE = process.env.REACT_APP_PUBLIC_NODE;
export const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;
export const NETWORK = process.env.REACT_APP_NETWORK as Network | undefined;
export const ETH_NETWORK = process.env.REACT_APP_ETH_NETWORK as EthNetwork | undefined;
export const SOURCE_VERSION = process.env.REACT_APP_SOURCE_VERSION;

export const environment = ((process.env.NODE_ENV === "development") ? "local" : NETWORK) || "unknown";

export const ETH_NETWORK_LABEL = ETH_NETWORK ? EthNetworkLabel[ETH_NETWORK] || ETH_NETWORK : ETH_NETWORK;
export const etherscan = `https://${ETH_NETWORK === EthNetwork.Mainnet ? "" : `${ETH_NETWORK}.`}etherscan.io`;
