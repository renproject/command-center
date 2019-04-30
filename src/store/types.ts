// tslint:disable:no-object-literal-type-assertion

import RenExSDK from "@renex/renex";
import BigNumber from "bignumber.js";

import { List, Map, OrderedMap } from "immutable";

import { NETWORK } from "../lib/environmentVariables";
import { _captureBackgroundException_ } from "../lib/errors";
import { Web3Browser } from "../lib/ethereum/browsers";
import { OldToken, Token } from "../lib/ethereum/tokens";
import { getReadOnlyWeb3 } from "../lib/ethereum/wallet";
import { Record } from "../lib/record";
import { RegistrationStatus } from "./actions/statistics/operatorActions";

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
    sdk: new RenExSDK(readOnlyWeb3.currentProvider, { network: NETWORK }) as RenExSDK | undefined,
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

    transactions: Map<string, string>(),

    withdrawAddresses: Map<Token, List<string>>(),
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

export class DarknodeDetails extends Record({
    ID: "",
    multiAddress: "",
    publicKey: "",
    ethBalance: new BigNumber(0),
    feesEarned: OrderedMap<Token, BigNumber>(),
    oldFeesEarned: OrderedMap<OldToken, BigNumber>(),
    feesEarnedTotalEth: new BigNumber(0),

    averageGasUsage: 0,
    lastTopUp: null,
    expectedExhaustion: null,

    peers: 0,
    registrationStatus: "" as RegistrationStatus,
    operator: "",
}) { }
