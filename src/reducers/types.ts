// tslint:disable:no-object-literal-type-assertion

import RenExSDK from "@renex/renex";
import BigNumber from "bignumber.js";

import { List, Map, OrderedMap } from "immutable";

import { RegistrationStatus } from "../actions/statistics/operatorActions";
import { NETWORK } from "../environmentVariables";
import { _captureBackgroundException_ } from "../lib/errors";
import { Token } from "../lib/ethereum/tokens";
import { getReadOnlyProvider } from "../lib/ethereum/wallet";
import { Record } from "../lib/record";

interface Serializable<T> {
    serialize(): string;
    deserialize(str: string): T;
}

export interface ApplicationData {
    trader: TraderData;
    popup: PopupData;
    statistics: StatisticsData;
}

const readOnlyProvider = getReadOnlyProvider();

export class TraderData extends Record({
    // Login data
    address: null as string | null,
    web3BrowserName: "MetaMask",
    readOnlyProvider,
    sdk: new RenExSDK(readOnlyProvider, { network: NETWORK }) as RenExSDK | undefined,
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

export enum Currency {
    AUD = "aud",
    USD = "usd",
    ETH = "eth",
    BTC = "btc",
}

export type TokenPrices = Map<Token, Map<Currency, number>>;

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
}) implements Serializable<StatisticsData> {
    public serialize(): string {
        const js = this.toJS();
        return JSON.stringify({
            darknodeList: js.darknodeList,
            darknodeNames: js.darknodeNames,
            darknodeRegisteringList: js.darknodeRegisteringList,
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
    feesEarnedTotalEth: new BigNumber(0),

    averageGasUsage: 0,
    lastTopUp: null,
    expectedExhaustion: null,

    peers: 0,
    registrationStatus: "" as RegistrationStatus,
    operator: "",
}) { }
