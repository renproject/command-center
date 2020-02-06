import { RenNetworkDetails } from "@renproject/contracts";
import HDWalletProvider from "@truffle/hdwallet-provider";
import { should } from "chai";
import { join } from "path";
import Web3 from "web3";
import { AbiItem } from "web3-utils";

should();

const snapshotEVM = async (web3: Web3) => {
    return await web3.currentProvider.send("evm_snapshot", []);
};

export const resetEVM = async (web3: Web3, snapshotID: string) => {
    await web3.currentProvider.send("evm_revert", [snapshotID]);
};

export type Provider = { engine: { stop: () => void; } };

const ganache = (buildPath: string, networkID: number) => {
    // tslint:disable: non-literal-require
    const zBTC = require(join(buildPath, "zBTC.json"));
    const zZEC = require(join(buildPath, "zZEC.json"));
    const ZECShifter = require(join(buildPath, "ZECShifter.json"));
    const zBCH = require(join(buildPath, "zBCH.json"));
    const BCHShifter = require(join(buildPath, "BCHShifter.json"));
    const ShifterRegistry = require(join(buildPath, "ShifterRegistry.json"));
    const RenToken = require(join(buildPath, "RenToken.json"));
    const DarknodeSlasher = require(join(buildPath, "DarknodeSlasher.json"));
    const DarknodeRegistryStore = require(join(buildPath, "DarknodeRegistryStore.json"));
    const DarknodeRegistry = require(join(buildPath, "DarknodeRegistry.json"));
    const DarknodePaymentStore = require(join(buildPath, "DarknodePaymentStore.json"));
    const DarknodePayment = require(join(buildPath, "DarknodePayment.json"));
    const BTCShifter = require(join(buildPath, "BTCShifter.json"));
    const Protocol = require(join(buildPath, "Protocol.json"));
    const ProtocolLogic = require(join(buildPath, "ProtocolLogic.json"));
    const BasicAdapter = require(join(buildPath, "BasicAdapter.json"));
    const ERC20 = require("darknode-sol/build/erc/ERC20.json");
    // tslint:enable: non-literal-require

    return {
        name: "localnet",
        chain: "kovan",
        label: "Localnet",
        chainLabel: "Kovan",
        networkID,
        infura: "https://kovan.infura.io",
        etherscan: "https://kovan.etherscan.io",
        renVM: {
            mpkh: "0x0c0b293a30e5398533783f344c296f57d78e4cbc",
            mintAuthority: "0x04084f1cACCB87Dcab9a29a084281294dA96Bf44",
        },
        addresses: {
            ren: {
                Protocol: {
                    address: Protocol.networks[networkID].address,
                    abi: ProtocolLogic.abi as AbiItem[],
                    artifact: Protocol,
                },
                DarknodeSlasher: {
                    address: DarknodeSlasher.networks[networkID].address,
                    abi: DarknodeSlasher.abi as AbiItem[],
                    artifact: DarknodeSlasher,
                },
                DarknodeRegistry: {
                    address: DarknodeRegistry.networks[networkID].address,
                    abi: DarknodeRegistry.abi as AbiItem[],
                    artifact: DarknodeRegistry,
                    block: 0
                },
                DarknodeRegistryStore: {
                    address: DarknodeRegistryStore.networks[networkID].address,
                    abi: DarknodeRegistryStore.abi as AbiItem[],
                    artifact: DarknodeRegistryStore,
                },
                DarknodePayment: {
                    address: DarknodePayment.networks[networkID].address,
                    abi: DarknodePayment.abi as AbiItem[],
                    artifact: DarknodePayment,
                },
                DarknodePaymentStore: {
                    address: DarknodePaymentStore.networks[networkID].address,
                    abi: DarknodePaymentStore.abi as AbiItem[],
                    artifact: DarknodePaymentStore,
                },
            },
            shifter: {
                ShifterRegistry: {
                    address: ShifterRegistry.networks[networkID].address,
                    abi: ShifterRegistry.abi as AbiItem[],
                    artifact: ShifterRegistry,
                },
                zBTC: {
                    _address: zBTC.networks[networkID].address,
                    abi: zBTC.abi as AbiItem[],
                    artifact: zBTC,
                    description: "shifterRegistry.getTokenBySymbol(zBTC)",
                },
                BTCShifter: {
                    _address: BTCShifter.networks[networkID].address,
                    abi: BTCShifter.abi as AbiItem[],
                    artifact: BTCShifter,
                    description: "shifterRegistry.getShifterBySymbol(zBTC)",
                },
                zZEC: {
                    _address: zZEC.networks[networkID].address,
                    abi: zZEC.abi as AbiItem[],
                    artifact: zZEC,
                    description: "shifterRegistry.getTokenBySymbol(zZEC)",
                },
                ZECShifter: {
                    _address: ZECShifter.networks[networkID].address,
                    abi: ZECShifter.abi as AbiItem[],
                    artifact: ZECShifter,
                    description: "shifterRegistry.getShifterBySymbol(zZEC)",
                },
                zBCH: {
                    _address: zBCH.networks[networkID].address,
                    abi: zBCH.abi as AbiItem[],
                    artifact: zBCH,
                    description: "shifterRegistry.getTokenBySymbol(zBCH)",
                },
                BCHShifter: {
                    _address: BCHShifter.networks[networkID].address,
                    abi: BCHShifter.abi as AbiItem[],
                    artifact: BCHShifter,
                    description: "shifterRegistry.getShifterBySymbol(zBCH)",
                },
                BasicAdapter: {
                    address: BasicAdapter.networks[networkID].address,
                    abi: BasicAdapter.abi as AbiItem[],
                    artifact: BasicAdapter,
                },
            },
            tokens: {
                DAI: {
                    address: "0xc4375b7de8af5a38a93548eb8453a498222c4ff2",
                    decimals: 18
                },
                BTC: {
                    address: zBTC.networks[networkID].address,
                    abi: zBTC.abi as AbiItem[],
                    artifact: zBTC,
                    decimals: 8
                },
                ZEC: {
                    address: zZEC.networks[networkID].address,
                    abi: zZEC.abi as AbiItem[],
                    artifact: zZEC,
                    decimals: 8
                },
                BCH: {
                    address: zBCH.networks[networkID].address,
                    abi: zBCH.abi as AbiItem[],
                    artifact: zBCH,
                    decimals: 8
                },
                REN: {
                    address: RenToken.networks[networkID].address,
                    abi: RenToken.abi as AbiItem[],
                    artifact: RenToken,
                    decimals: 18
                },
                ETH: {
                    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                    decimals: 18
                },
            },
            erc: {
                ERC20: {
                    abi: ERC20.abi as AbiItem[],
                    artifact: ERC20,
                },
            },
        }
    };
};

export const createWeb3 = async () => {
    // Mnemonic generated by `ganache-cli -d`
    const mnemonic = "myth like bonus scare over problem client lizard pioneer submit female collect";
    const provider = new HDWalletProvider(mnemonic, "http://localhost:8545");
    const web3: Web3 = new Web3(provider);
    const networkID: number = await web3.eth.net.getId();
    const network: RenNetworkDetails = ganache(join(process.cwd(), "./node_modules/darknode-sol/build/development/"), networkID);
    const address: string = (await web3.eth.getAccounts())[0];

    return { web3, networkID, network, address, provider };
};

// This is run by Jest once before running any tests. Globals can be accessed by
// the global teardown but not by the tests. (`globalSetup` is configured in
// `package.json`).
const globalSetup = async () => {
    const { web3, provider } = await createWeb3();
    // tslint:disable-next-line: no-any
    (global as any).web3 = web3;
    // tslint:disable-next-line: no-any
    (global as any).snapshotID = await snapshotEVM(web3);
    // tslint:disable-next-line: no-any
    (global as any).provider = provider;
};

export default globalSetup;
