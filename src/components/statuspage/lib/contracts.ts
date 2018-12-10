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

const contracts = (network: string) => {
    const ERC20: Contract = {
        ABI: require("./ABIs/ERC20.json"),
        address: ""
    };

    let path;
    let vault;
    switch (network) {
        case MAINNET:
            path = "mainnet";
            vault = "0x880407C9Cd119BeF48b1821CdfC434e3ca3cd588";
            break;
        case TESTNET:
        default:
            path = "testnet";
            vault = "0xc08Dfa565EdB7216c3b23bBf0848B43fE9a49F0E";
            break;
    }

    const DarknodeRewardVault: Contract = {
        ABI: require(`./ABIs/${path}/DarknodeRewardVault.json`),
        address: vault,
    };

    return { ERC20, DarknodeRewardVault };
};

export default contracts("testnet");
