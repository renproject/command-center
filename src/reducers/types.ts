// tslint:disable:no-object-literal-type-assertion

import * as Sentry from "@sentry/browser";

import RenExSDK, { OrderSettlement } from "renex-sdk-ts";
import Web3 from "web3";

import { Map, OrderedMap } from "immutable";

import { INFURA_URL, networkData } from "@Library/network";
import { Record } from "@Library/record";
import { Wallet } from "@Library/wallets/wallet";

export interface Serializable<T> {
    serialize(): string;
    deserialize(str: string): T;
}

export interface ApplicationData {
    trader: TraderData;
    alert: AlertData;
    popup: PopupData;
}

export class TraderData extends Record({
    address: null as string | null,
    sdk: new RenExSDK(new Web3.providers.HttpProvider(INFURA_URL), networkData, "", {
        minimumTradeVolume: new Web3().utils.toWei("1", "ether"),
    }),

    wallet: null as Wallet | null,
}) implements Serializable<TraderData> {
    public serialize(): string {
        return JSON.stringify({
            address: this.address,
        });
    }

    public deserialize(str: string): TraderData {
        let next = this;
        try {
            const data = JSON.parse(str);
            next = next.set("address", data.address);
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
    pendingAlerts: Map<string, () => Promise<void>>(),
    alert: { message: "" } as Alert
}) { }

export class PopupData extends Record({
    popup: null as JSX.Element | null,
    dismissible: true,
    onCancel: (() => null) as () => void,
}) { }