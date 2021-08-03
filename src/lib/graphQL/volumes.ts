import { OrderedMap } from "immutable";
import moment from "moment";

import { TokenString } from "../ethereum/tokens";

export enum PeriodOption {
    HOUR = "HOUR",
    DAY = "DAY",
    WEEK = "WEEK",
    MONTH = "MONTH",
    YEAR = "YEAR",
    ALL = "ALL",
}

export enum VolumeNetwork {
    Ethereum = "Ethereum",
    EthereumTestnet = "EthereumTestnet",
    BSC = "BSC",
    BSCTestnet = "BSCTestnet",
    Fantom = "Fantom",
    Polygon = "Polygon",
}

const getNetworkStart = (volumeNetwork: VolumeNetwork) => {
    switch (volumeNetwork) {
        case VolumeNetwork.BSCTestnet:
            return "2020-11-03T00+00";
        case VolumeNetwork.BSC:
            return "2021-02-11T00+00";
        case VolumeNetwork.EthereumTestnet:
            return "2020-04-15T00+00";
        case VolumeNetwork.Ethereum:
        default:
            return "2020-05-27T00+00";
    }
};

export const tokenArrayToMap = <T extends { symbol: string }>(
    array: T[],
): OrderedMap<TokenString, T> =>
    array.reduce(
        (acc, tokenLocked) =>
            acc.set(
                tokenLocked.symbol
                    .replace(/^ren/, "")
                    .replace(/^test/, "")
                    .replace(/^dev/, ""),
                tokenLocked,
            ),
        OrderedMap<TokenString, T>(),
    );

export const getPeriodTimespan = (
    type: string,
    volumeNetwork: VolumeNetwork = VolumeNetwork.Ethereum,
): number => {
    const minutes = 60; // 60 seconds
    const hours = 60 * minutes;
    const days = 24 * hours;
    const weeks = 7 * days;
    const months = 31 * days;
    const years = 365 * days;

    switch (type) {
        case PeriodOption.HOUR:
            return 1 * hours;
        case PeriodOption.DAY:
            return 1 * days;
        case PeriodOption.WEEK:
            return 1 * weeks;
        case PeriodOption.MONTH:
            return 1 * months;
        case PeriodOption.YEAR:
            return 1 * years;
        case PeriodOption.ALL:
            // Mar-24-2020 11:22:40 PM UTC
            // return Math.floor(moment().diff("2020-03-24T00+00") / 1000);
            return Math.floor(
                moment().diff(getNetworkStart(volumeNetwork)) / 1000,
            );
        default:
            throw new Error(`Unknown period type ${type}`);
    }
};
