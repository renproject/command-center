// tslint:disable:no-object-literal-type-assertion

import BigNumber from "bignumber.js";
import { List, Map, OrderedMap } from "immutable";
import { PromiEvent } from "web3-core";

import { DEPLOYMENT } from "../lib/environmentVariables";
import { _captureBackgroundException_ } from "../lib/errors";
import { Web3Browser } from "../lib/ethereum/browsers";
import { OldToken, Token } from "../lib/ethereum/tokens";
import { getReadOnlyWeb3 } from "../lib/ethereum/wallet";
import { Record } from "../lib/record";
import { RegistrationStatus } from "./actions/statistics/operatorActions";

export enum Network {
    Mainnet = "Mainnet",
    Testnet = "testnet",
    Devnet = "devnet",
    Localnet = "localnet",
}

export enum EthNetwork {
    Kovan = "kovan",
    Mainnet = "main",
}

const EthNetworkLabel = {
    [EthNetwork.Kovan]: "Kovan",
    [EthNetwork.Mainnet]: "Mainnet",
};
export const getNetworkLabel = (ethNetwork: EthNetwork | undefined) => ethNetwork ? EthNetworkLabel[ethNetwork] || ethNetwork : ethNetwork;

interface Serializable<T> {
    serialize(): string;
    deserialize(str: string): T;
}

export interface ApplicationData {
    trader: TraderData;
    popup: PopupData;
    statistics: StatisticsData;
    ui: UIData;
}

export const readOnlyWeb3 = getReadOnlyWeb3();

export class TraderData extends Record({
    // Login data
    address: null as string | null,
    web3BrowserName: Web3Browser.MetaMask,
    web3: readOnlyWeb3,

    ethNetwork: EthNetwork.Mainnet,
}) { }

export enum LabelLevel {
    Info = "info",
    Warning = "warning"
}

export class PopupData extends Record({
    dismissible: true,
    onCancel: (() => null) as () => void,
    popup: null as JSX.Element | null,
    overlay: false,
}) { }

export class UIData extends Record({
    mobileMenuActive: false,
}) { }

export enum Currency {
    AUD = "aud",
    CNY = "cny",
    GBP = "gbp",
    EUR = "eur",
    JPY = "jpy",
    KRW = "krw",
    USD = "usd",

    ETH = "eth",
    BTC = "btc",
}

export const currencies = [
    { currency: Currency.AUD, description: "Australian Dollar (AUD)", },
    { currency: Currency.GBP, description: "British Pound (GBP)", },
    { currency: Currency.CNY, description: "Chinese Yuan (CNY)", },
    { currency: Currency.EUR, description: "Euro (EUR)", },
    { currency: Currency.JPY, description: "Japanese Yen (JPY)", },
    { currency: Currency.KRW, description: "Korean Won (KRW)", },
    { currency: Currency.USD, description: "US Dollar (USD)", },

    { currency: Currency.ETH, description: "Ethereum (ETH)", },
    { currency: Currency.BTC, description: "Bitcoin (BTC)", },
];

export type TokenPrices = Map<Token | OldToken, Map<Currency, number>>;

export class StatisticsData extends Record({
    network: DEPLOYMENT,

    minimumBond: null as BigNumber | null,
    secondsPerBlock: null as number | null,

    tokenPrices: null as TokenPrices | null,
    quoteCurrency: Currency.USD,

    darknodeCount: null as BigNumber | null,
    orderCount: null as BigNumber | null,

    darknodeDetails: Map<string, DarknodeDetails>(),

    balanceHistories: Map<string, OrderedMap<number, BigNumber>>(),

    darknodeNames: Map<string, string>(),
    darknodeRegisteringList: Map<string, string>(),
    darknodeList: Map<string, List<string>>(),

    // tslint:disable-next-line: no-any
    transactions: OrderedMap<string, PromiEvent<any>>(),
    confirmations: OrderedMap<string, number>(),

    withdrawAddresses: Map<Token, List<string>>(),

    currentCycle: "",
    previousCycle: "",
    pendingRewards: OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>(),
    pendingTotalInEth: OrderedMap<string /* cycle */, BigNumber>(),
    cycleTimeout: new BigNumber(0),
}) implements Serializable<StatisticsData> {
    public serialize(): string {
        const js = this.toJS();
        return JSON.stringify({
            darknodeList: js.darknodeList,
            darknodeNames: js.darknodeNames,
            darknodeRegisteringList: js.darknodeRegisteringList,
            withdrawAddresses: js.withdrawAddresses,
        });
    }

    public deserialize(str: string): StatisticsData {
        // let next = this;
        try {
            const data = JSON.parse(str);
            // next = next.set("address", data.address);
            return new StatisticsData({
                darknodeList: data.darknodeList,
                darknodeNames: data.darknodeNames,
                darknodeRegisteringList: data.darknodeRegisteringList,
                withdrawAddresses: data.withdrawAddresses,
            });
        } catch (error) {
            _captureBackgroundException_(error, {
                description: "Cannot deserialize local storage",
            });
            return this;
        }
    }
}

export enum DarknodeFeeStatus {
    BLACKLISTED = "BLACKLISTED",
    CLAIMED = "CLAIMED",
    NOT_CLAIMED = "NOT_CLAIMED",
    NOT_WHITELISTED = "NOT_WHITELISTED",
}

export class DarknodeDetails extends Record({
    ID: "",
    multiAddress: "",
    publicKey: "",
    ethBalance: new BigNumber(0),
    feesEarned: OrderedMap<Token, BigNumber>(),
    oldFeesEarned: OrderedMap<OldToken, BigNumber>(),
    feesEarnedTotalEth: new BigNumber(0),

    cycleStatus: OrderedMap<string, DarknodeFeeStatus>(),

    averageGasUsage: 0,
    lastTopUp: null,
    expectedExhaustion: null,

    peers: 0,
    registrationStatus: "" as RegistrationStatus,
    operator: "",
}) { }
