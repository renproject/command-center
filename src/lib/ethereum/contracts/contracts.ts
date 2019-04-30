import { AbiItem } from "web3-utils";

import { NETWORK } from "../../environmentVariables";

// Contracts
interface Contract {
    ABI: AbiItem[];
    address: string;
    deployedInBlock?: string; // hex string
}

const TESTNET = "testnet";
const MAINNET = "mainnet";

const getContractsForNetwork = (network: string | undefined) => {
    const ERC20: Contract = {
        // tslint:disable-next-line: no-require-imports
        ABI: require("./ABIs/ERC20.json"),
        address: ""
    };

    let path;
    let darknodeRegistry;
    let darknodeRewardVault;
    let dnrDeployedInBlock;
    let darknodePayment;
    switch (network) {
        case MAINNET:
            path = "mainnet";

            // Change these together
            darknodeRegistry = "0x34bd421C7948Bc16f826Fd99f9B785929b121633";
            dnrDeployedInBlock = "0x6AED46"; // in hex

            darknodeRewardVault = "0xa96450d3386ece22db20b0ac96ef5684b6d95d53";
            darknodePayment = "";
            throw new Error("mainnet unsupported");

            break;
        case TESTNET:
        default:
            path = "testnet";

            // Change these together
            darknodeRegistry = "0x1C6309618338D0EDf9a7Ea8eA18E060fD323020D";
            dnrDeployedInBlock = "0xA35A7A"; // in hex

            darknodeRewardVault = "0xc08Dfa565EdB7216c3b23bBf0848B43fE9a49F0E";
            darknodePayment = "0x11F0A63d61344a00103Dd7EC9bF6d8c548CEB0A4";
    }

    const DarknodeRegistry: Contract = {
        // tslint:disable-next-line: non-literal-require
        ABI: require(`./ABIs/${path}/DarknodeRegistry.json`),
        address: darknodeRegistry,
        deployedInBlock: dnrDeployedInBlock,
    };

    const DarknodeRewardVault: Contract = {
        // tslint:disable-next-line: non-literal-require
        ABI: require(`./ABIs/${path}/DarknodeRewardVault.json`),
        address: darknodeRewardVault,
    };

    const DarknodePayment: Contract = {
        // tslint:disable-next-line: non-literal-require
        ABI: require(`./ABIs/${path}/DarknodePayment.json`),
        address: darknodePayment,
    };

    const WarpGateToken: Contract = {
        // tslint:disable-next-line: non-literal-require
        ABI: require(`./ABIs/${path}/WarpGateToken.json`),
        address: "",
    };

    return { ERC20, DarknodeRegistry, DarknodePayment, DarknodeRewardVault, WarpGateToken };
};

export const contracts = getContractsForNetwork(NETWORK);
