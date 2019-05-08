import { AbiItem } from "web3-utils";

import { EthNetwork, Network } from "../../../store/types";
import { OldToken, Token } from "../tokens";

// Contracts
interface Contract {
    ABI: AbiItem[];
    address: string;
    deployedInBlock?: string; // hex string
}

const requireABIsForNetwork = (ethNetwork: EthNetwork) => {
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
    let darknodePaymentStore;
    switch (ethNetwork) {
        case EthNetwork.Mainnet:
            path = "mainnet";

            // Change these together
            darknodeRegistry = "0x34bd421C7948Bc16f826Fd99f9B785929b121633";
            dnrDeployedInBlock = "0x6AED46"; // in hex

            darknodeRewardVault = "0xa96450d3386ece22db20b0ac96ef5684b6d95d53";
            darknodePaymentStore = "0x731Ea4Ba77fF184d89dBeB160A0078274Acbe9D2";
            darknodePayment = "0x5a7802E66b067cB1770ee5b1165AA201690A8B6a";

            break;
        case EthNetwork.Kovan:
        default:
            path = "testnet";

            // Change these together
            darknodeRegistry = "0x1C6309618338D0EDf9a7Ea8eA18E060fD323020D";
            dnrDeployedInBlock = "0xA35A7A"; // in hex

            darknodeRewardVault = "0xc08Dfa565EdB7216c3b23bBf0848B43fE9a49F0E";
            darknodePaymentStore = "0xA9411C3AD1fBE168fd119A3B32fB481a0b9877A9";
            darknodePayment = "0xba8d77a48d24866be4b775e732f6f8d198f7ba26";
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

    const DarknodePaymentStore: Contract = {
        // tslint:disable-next-line: non-literal-require
        ABI: require(`./ABIs/${path}/DarknodePaymentStore.json`),
        address: darknodePaymentStore,
    };

    const WarpGateToken: Contract = {
        // tslint:disable-next-line: non-literal-require
        ABI: require(`./ABIs/${path}/WarpGateToken.json`),
        address: "",
    };

    return { ERC20, DarknodeRegistry, DarknodePayment, DarknodeRewardVault, WarpGateToken, DarknodePaymentStore };
};

const kovanContracts = requireABIsForNetwork(EthNetwork.Kovan);
const mainnetContracts = requireABIsForNetwork(EthNetwork.Mainnet);

export const getContracts = (ethNetwork: EthNetwork) => {
    // eslint-disable-next-line
    switch (ethNetwork) {
        case EthNetwork.Kovan:
            return kovanContracts;
        case EthNetwork.Mainnet:
            return mainnetContracts;
    }
};

export const tokenAddresses = (token: Token | OldToken, ethNetwork: EthNetwork): string => {
    // eslint-disable-next-line
    switch (ethNetwork) {
        case EthNetwork.Mainnet:
            // eslint-disable-next-line
            switch (token) {
                case Token.DAI:
                    return "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359";
                case Token.ETH:
                    return "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
                case Token.BTC:
                    throw new Error("No address");
                case Token.ZEC:
                    throw new Error("No address");
                case OldToken.ETH:
                    return "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
                case OldToken.DGX:
                    return "0x4f3AfEC4E5a3F2A6a1A411DEF7D7dFe50eE057bF";
                case OldToken.REN:
                    return "0x408e41876cCCDC0F92210600ef50372656052a38";
                case OldToken.TUSD:
                    return "0x8dd5fbCe2F6a956C3022bA3663759011Dd51e73E";
                case OldToken.OMG:
                    return "0xd26114cd6EE289AccF82350c8d8487fedB8A0C07";
                case OldToken.ZRX:
                    return "0xE41d2489571d322189246DaFA5ebDe1F4699F498";
            }
            break;
        case EthNetwork.Kovan:
            // eslint-disable-next-line
            switch (token) {
                case Token.DAI:
                    return "0xc4375b7de8af5a38a93548eb8453a498222c4ff2";
                case Token.ETH:
                    return "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
                case Token.BTC:
                    return "0x2a8368d2a983a0aeae8da0ebc5b7c03a0ea66b37";
                case Token.ZEC:
                    return "0xd67256552f93b39ac30083b4b679718a061feae6";
                case OldToken.ETH:
                    return "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
                case OldToken.DGX:
                    return "0x7d6D31326b12B6CBd7f054231D47CbcD16082b71";
                case OldToken.REN:
                    return "0x2cd647668494c1b15743ab283a0f980d90a87394";
                case OldToken.TUSD:
                    return "0x525389752ffe6487d33EF53FBcD4E5D3AD7937a0";
                case OldToken.OMG:
                    return "0x66497ba75dD127b46316d806c077B06395918064";
                case OldToken.ZRX:
                    return "0x6EB628dCeFA95802899aD3A9EE0C7650Ac63d543";
            }
            break;
    }
    throw new Error(`Unknown network ${Network} or token ${token}`);
};
