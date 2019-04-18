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
    let dnrDeployedInBlock;
    let darknodePayment;
    let darknodePaymentStore;
    switch (network) {
        case MAINNET:
            path = "mainnet";

            // Change these together
            darknodeRegistry = "0x34bd421C7948Bc16f826Fd99f9B785929b121633";
            dnrDeployedInBlock = "0x6AED46"; // in hex

            darknodePayment = "";
            darknodePaymentStore = "";
            throw new Error("mainnet unsupported");

            break;
        case TESTNET:
        default:
            path = "testnet";

            // Change these together
            darknodeRegistry = "0x1C6309618338D0EDf9a7Ea8eA18E060fD323020D";
            dnrDeployedInBlock = "0xA35A7A"; // in hex

            darknodePayment = "0x803e31322CEa77318C57264eC7AFf9945f69d3ea";
            darknodePaymentStore = "0x4cE24F16F031d10a953C080927012CA07B1575eE";
    }

    const DarknodeRegistry: Contract = {
        // tslint:disable-next-line: non-literal-require
        ABI: require(`./ABIs/${path}/DarknodeRegistry.json`),
        address: darknodeRegistry,
        deployedInBlock: dnrDeployedInBlock,
    };

    const DarknodePayment: Contract = {
        // tslint:disable-next-line: non-literal-require
        ABI: require(`./ABIs/${path}/DarknodePayment.json`),
        address: darknodePayment,
    };

    const DarknodePaymentStore: Contract = {
        // tslint:disable-next-line: non-literal-require
        ABI: require(`./ABIs/${path}/DarknodePaymentStore.json`),
        address: darknodePaymentStore,
    };

    return { ERC20, DarknodeRegistry, DarknodePayment, DarknodePaymentStore };
};

export const contracts = getContractsForNetwork(NETWORK);
