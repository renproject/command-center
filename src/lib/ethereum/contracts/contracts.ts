import { NETWORK } from "../../../environmentVariables";

// Contracts
export interface Contract {
    ABI: Array<unknown>;
    address: string;
    deployedInBlock?: string; // hex string
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
    let dnrDeployedInBlock;
    switch (network) {
        case MAINNET:
            path = "mainnet";

            // Change these together
            darknodeRegistry = "0x34bd421C7948Bc16f826Fd99f9B785929b121633";
            dnrDeployedInBlock = "0x6AED46"; // in hex

            darknodeRewardVault = "0xa96450d3386ece22db20b0ac96ef5684b6d95d53";
            break;
        case TESTNET:
        default:
            path = "testnet";

            // Change these together
            darknodeRegistry = "0x75Fa8349fc9C7C640A4e9F1A1496fBB95D2Dc3d5";
            dnrDeployedInBlock = "0x889E55"; // in hex

            darknodeRewardVault = "0xc08Dfa565EdB7216c3b23bBf0848B43fE9a49F0E";
            break;
    }

    const DarknodeRegistry: Contract = {
        ABI: require(`./ABIs/${path}/DarknodeRegistry.json`),
        address: darknodeRegistry,
        deployedInBlock: dnrDeployedInBlock,
    };

    const DarknodeRewardVault: Contract = {
        ABI: require(`./ABIs/${path}/DarknodeRewardVault.json`),
        address: darknodeRewardVault,
    };

    return { ERC20, DarknodeRegistry, DarknodeRewardVault };
};

export const contracts = getContractsForNetwork(NETWORK);
