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

const ganache = (buildPath: string, networkID: number): RenNetworkDetails => {
    // tslint:disable: non-literal-require
    const ProtocolProxy = require(join(buildPath, "ProtocolProxy.json"));
    const ProtocolLogic = require(join(buildPath, "ProtocolLogic.json"));
    const GatewayLogic = require(join(buildPath, "GatewayLogic.json"));
    const RenBTC = require(join(buildPath, "RenBTC.json"));
    const BTCGateway = require(join(buildPath, "BTCGateway.json"));
    const RenZEC = require(join(buildPath, "RenZEC.json"));
    const ZECGateway = require(join(buildPath, "ZECGateway.json"));
    const RenBCH = require(join(buildPath, "RenBCH.json"));
    const BCHGateway = require(join(buildPath, "BCHGateway.json"));
    const GatewayRegistry = require(join(buildPath, "GatewayRegistry.json"));
    const RenToken = require(join(buildPath, "RenToken.json"));
    const DarknodeSlasher = require(join(buildPath, "DarknodeSlasher.json"));
    const DarknodeRegistryStore = require(join(buildPath, "DarknodeRegistryStore.json"));
    const DarknodeRegistryProxy = require(join(buildPath, "DarknodeRegistryProxy.json"));
    const DarknodeRegistryLogic = require(join(buildPath, "DarknodeRegistryLogic.json"));
    const DarknodePaymentStore = require(join(buildPath, "DarknodePaymentStore.json"));
    const DarknodePayment = require(join(buildPath, "DarknodePayment.json"));
    const BasicAdapter = require(join(buildPath, "BasicAdapter.json"));
    const ERC20 = require("darknode-sol/build/erc/ERC20.json");
    // tslint:enable: non-literal-require

    return {
        version: "1.0.0",
        name: "localnet",
        chain: "kovan",
        label: "Localnet",
        chainLabel: "Kovan",
        networkID,
        infura: "https://kovan.infura.io",
        etherscan: "https://kovan.etherscan.io",
        isTestnet: true,
        lightnode: "",
        // renVM: {
        //     mpkh: "0x0c0b293a30e5398533783f344c296f57d78e4cbc",
        //     mintAuthority: "0x04084f1cACCB87Dcab9a29a084281294dA96Bf44",
        // },
        addresses: {
            ren: {
                Protocol: {
                    address: ProtocolProxy.networks[networkID].address,
                    abi: ProtocolLogic.abi as AbiItem[],
                    artifact: ProtocolProxy,
                },
                DarknodeSlasher: {
                    address: DarknodeSlasher.networks[networkID].address,
                    abi: DarknodeSlasher.abi as AbiItem[],
                    artifact: DarknodeSlasher,
                },
                DarknodeRegistry: {
                    address: DarknodeRegistryProxy.networks[networkID].address,
                    abi: DarknodeRegistryLogic.abi as AbiItem[],
                    artifact: DarknodeRegistryLogic,
                    block: 17625998,
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
            gateways: {
                GatewayRegistry: {
                    address: GatewayRegistry.networks[networkID].address,
                    abi: GatewayRegistry.abi as AbiItem[],
                    artifact: GatewayRegistry,
                },
                RenBTC: {
                    _address: RenBTC.networks[networkID].address,
                    abi: RenBTC.abi as AbiItem[],
                    artifact: RenBTC,
                    description: "gatewayRegistry.getTokenBySymbol(\"BTC\")",
                },
                BTCGateway: {
                    _address: BTCGateway.networks[networkID].address,
                    abi: GatewayLogic.abi as AbiItem[],
                    artifact: GatewayLogic,
                    description: "gatewayRegistry.getGatewayBySymbol(\"BTC\")",
                },
                RenZEC: {
                    _address: RenZEC.networks[networkID].address,
                    abi: RenZEC.abi as AbiItem[],
                    artifact: RenZEC,
                    description: "gatewayRegistry.getTokenBySymbol(\"ZEC\")",
                },
                ZECGateway: {
                    _address: ZECGateway.networks[networkID].address,
                    abi: GatewayLogic.abi as AbiItem[],
                    artifact: GatewayLogic,
                    description: "gatewayRegistry.getGatewayBySymbol(\"ZEC\")",
                },
                RenBCH: {
                    _address: RenBCH.networks[networkID].address,
                    abi: RenBCH.abi as AbiItem[],
                    artifact: RenBCH,
                    description: "gatewayRegistry.getTokenBySymbol(\"BCH\")",
                },
                BCHGateway: {
                    _address: BCHGateway.networks[networkID].address,
                    abi: GatewayLogic.abi as AbiItem[],
                    artifact: GatewayLogic,
                    description: "gatewayRegistry.getGatewayBySymbol(\"BCH\")",
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
                    address: RenBTC.networks[networkID].address,
                    abi: RenBTC.abi as AbiItem[],
                    artifact: RenBTC,
                    decimals: 8
                },
                ZEC: {
                    address: RenZEC.networks[networkID].address,
                    abi: RenZEC.abi as AbiItem[],
                    artifact: RenZEC,
                    decimals: 8
                },
                BCH: {
                    address: RenBCH.networks[networkID].address,
                    abi: RenBCH.abi as AbiItem[],
                    artifact: RenBCH,
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
    const network: RenNetworkDetails = ganache(join(process.cwd(), "./node_modules/darknode-sol/build/localnet/"), networkID);
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
