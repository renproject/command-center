import { NETWORK } from "../../environmentVariables";

// TODO: Generate production key
export const INFURA_KEY = "8ZCgtqu4tkIIRHh9hFZj";

// Contracts
export interface Contract {
    // tslint:disable-next-line:no-any
    ABI: any[];
    address: string;
}

export const NIGHTLY = "nightly";
export const FALCON = "falcon";
export const TESTNET = "testnet";
export const MAINNET = "mainnet";

const getContractsForNetwork = (network: string | undefined) => {
    const ERC20: Contract = {
        ABI: require("./ABIs/ERC20.json"),
        address: ""
    };

    let path;
    let darknodeRegistry;
    let darknodeRewardVault;
    switch (network) {
        case MAINNET:
            path = "mainnet";
            darknodeRegistry = "0x34bd421C7948Bc16f826Fd99f9B785929b121633";
            darknodeRewardVault = "0x880407C9Cd119BeF48b1821CdfC434e3ca3cd588";
            break;
        case TESTNET:
        default:
            path = "testnet";
            darknodeRegistry = "0x75Fa8349fc9C7C640A4e9F1A1496fBB95D2Dc3d5";
            darknodeRewardVault = "0xc08Dfa565EdB7216c3b23bBf0848B43fE9a49F0E";
            break;
    }

    const DarknodeRegistry: Contract = {
        ABI: require(`./ABIs/${path}/DarknodeRegistry.json`),
        address: darknodeRegistry,
    };

    const DarknodeRewardVault: Contract = {
        ABI: require(`./ABIs/${path}/DarknodeRewardVault.json`),
        address: darknodeRewardVault,
    };

    return { ERC20, DarknodeRegistry, DarknodeRewardVault };
};

export const contracts = getContractsForNetwork(NETWORK);
