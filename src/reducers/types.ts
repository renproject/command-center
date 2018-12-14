// tslint:disable:no-object-literal-type-assertion

import * as Sentry from "@sentry/browser";

import RenExSDK, { OrderSettlement } from "@renex/renex";

import { List, Map, OrderedMap } from "immutable";

import { Record } from "@Library/general/record";
import BigNumber from "bignumber.js";

import { getReadOnlyProvider } from "@Library/wallets/wallet";
import { Token } from "../components/statuspage/lib/tokens";

export interface Serializable<T> {
    serialize(): string;
    deserialize(str: string): T;
}

export interface ApplicationData {
    trader: TraderData;
    alert: AlertData;
    popup: PopupData;
    statistics: StatisticsData;
}

const readOnlyProvider = getReadOnlyProvider();

export class TraderData extends Record({
    // Login data
    address: null as string | null,
    web3BrowserName: "MetaMask",
    readOnlyProvider,
    sdk: new RenExSDK(readOnlyProvider, { network: "testnet" }),
}) implements Serializable<TraderData> {
    public serialize(): string {
        return JSON.stringify({
            // address: this.address,
        });
    }

    public deserialize(str: string): TraderData {
        const next = this;
        try {
            // const data = JSON.parse(str);
            // next = next.set("address", data.address);
        } catch (err) {
            console.error(err);
            Sentry.captureException(`cannot deserialize local storage: ${err}`);
        }
        return next;
    }
}

export type Settlements = OrderedMap<OrderSettlement, boolean>;

export enum AlertType {
    Error = "error",
    Warning = "warning",
    Success = "success"
}

export enum LabelType {
    Info = "info",
    Warning = "warning"
}

export class Alert extends Record({
    alertType: AlertType.Warning,
    message: "", // TODO: Allow for links
}) { }

export class AlertData extends Record({
    alert: { message: "" } as Alert,
}) { }

export class PopupData extends Record({
    dismissible: true,
    onCancel: (() => null) as () => void,
    popup: null as JSX.Element | null,
}) { }

export enum Currency {
    AUD = "aud",
    USD = "usd",
    ETH = "eth",
    BTC = "btc",
}

export type TokenPrices = Map<Token, Map<Currency, number>>;

export class StatisticsData extends Record({
    tokenPrices: null as TokenPrices | null,
    quoteCurrency: Currency.USD,

    darknodeCount: null as BigNumber | null,
    orderCount: null as BigNumber | null,

    darknodeDetails: Map<string, DarknodeDetails>(),
    darknodeList: null as List<string> | null,
}) { }


export class DarknodeDetails extends Record({
    ID: "",
    name: "Darknode",
    multiAddress: "",
    publicKey: "",
    ethBalance: new BigNumber(0),
    feesEarned: OrderedMap<Token, BigNumber>(),
    feesEarnedTotalEth: new BigNumber(0),

    averageGasUsage: 0,
    lastTopUp: null,
    expectedExhaustion: null,

    peers: 0,
    registrationStatus: "",
    operator: "",
}) { }
