import { ApolloClient, gql } from "@apollo/react-hooks";
import { Currency } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { getConversionRate } from "../../../controllers/common/tokenBalanceUtils";
import { NetworkStatsChain } from "../../../controllers/pages/networkStatsPage/networkStatsContainer";
import { Token, TokenPrices } from "../../ethereum/tokens";
import { unifyTokenRecords } from "../../general/debugUtils";
import { getPeriodTimespan, PeriodType } from "../volumes";

export enum TrackerChain {
    Ethereum = "Ethereum",
    BinanceSmartChain = "BinanceSmartChain",
    Polygon = "Polygon",
    Fantom = "Fantom",
    Avalanche = "Avalanche",
}

export const networkStatsChainToTrackerChain = (chain: NetworkStatsChain) => {
    switch (chain) {
        case NetworkStatsChain.Ethereum:
            return TrackerChain.Ethereum;
        case NetworkStatsChain.BinanceSmartChain:
            return TrackerChain.BinanceSmartChain;
        case NetworkStatsChain.Fantom:
            return TrackerChain.Fantom;
        case NetworkStatsChain.Polygon:
            return TrackerChain.Polygon;
    }
};

type SnapshotAmount = {
    asset: string;
    chain: TrackerChain;
    amount: string;
    amountInUsd: string;
    amountInBtc: string;
    amountInEth: string;
};

type SnapshotAssetData = {
    asset: string;
    decimals: number;
    priceInUsd: number;
};

type Snapshot = {
    id: string;
    timestamp: number;
    locked: Array<SnapshotAmount>;
    volume: Array<SnapshotAmount>;
    prices: Array<SnapshotAssetData>;
};

export type BigNumberRecord = Record<string, BigNumber>;

export type SnapshotRecords = Record<string, Snapshot>;

interface SnapshotResponse {
    data: SnapshotRecords;
}

const snapshotCurrencies: Array<Currency | TokenCurrency> = [
    Currency.USD,
    Currency.BTC,
    Currency.ETH,
];

export enum TrackerType { // rename to SnapshotType
    Locked = "locked",
    Volume = "volume",
}

const VOLUME_FRAGMENT = `
    fragment VolumeSnapshot on Snapshot {
        id
        timestamp
        volume {
            asset
            chain
            amount
            amountInUsd
            amountInBtc
            amountInEth
        }
    }
`;

const LOCKED_FRAGMENT = `
    fragment LockedSnapshot on Snapshot {
        id
        timestamp
        locked {
            asset
            chain
            amount
            amountInUsd
            amountInBtc
            amountInEth
        }
    }
`;

const getSnapshotSubQuery = (ts: string, type: TrackerType) => `
    s${ts}: Snapshot(timestamp: "${ts}") {
        ...${type === TrackerType.Volume ? "VolumeSnapshot" : "LockedSnapshot"}
    }`;

export const queryRenVmTracker = async (
    client: ApolloClient<object>,
    type: TrackerType,
    period: PeriodType,
): Promise<SnapshotResponse> => {
    const query = buildRenVmTrackerQuery(type, period);
    return client.query<SnapshotRecords>({
        query,
    });
};

export const buildRenVmTrackerQuery = (
    type: TrackerType,
    period: PeriodType,
) => {
    const interval = getResolutionInterval(period);
    const points = getResolutionPoints(period);
    console.log(points);
    const endTimestamp = Math.floor(Date.now() / 1000);
    const subQueries = [];
    for (let i = 0; i < points; i++) {
        const timestamp = Math.ceil(endTimestamp - i * interval);
        const subQuery = getSnapshotSubQuery(timestamp.toString(), type);
        subQueries.push(subQuery);
    }
    const snapshotQuery = `
        ${type === TrackerType.Volume ? VOLUME_FRAGMENT : LOCKED_FRAGMENT}
        query GetSnapshots {
            assets: Snapshot(timestamp: "${endTimestamp}"){
                prices {
                    asset,
                    decimals
                }
            },
            ${subQueries.reverse().join(",")}
        }
    `;
    console.log(snapshotQuery);
    return gql(snapshotQuery);
};
export const getResolutionPoints = (period: PeriodType) => {
    const timespan = getPeriodTimespan(period);
    const interval = getResolutionInterval(period);
    return timespan / interval;
};

export const getResolutionInterval = (period: PeriodType) => {
    switch (period) {
        case PeriodType.HOUR:
            return 80;
        case PeriodType.DAY:
            return 30 * 60;
        case PeriodType.WEEK:
            return 2 * 3600;
        case PeriodType.MONTH:
            return 12 * 3600;
        case PeriodType.YEAR:
            return 5 * 24 * 3600;
        case PeriodType.ALL:
            return 6 * 24 * 3600;
    }
    return 5 * 24 * 3600;
};

export const getSnapshots = (records: SnapshotRecords) => {
    return Object.entries(records)
        .filter(([key]) => key !== "assets")
        .map(([, snapshot]) => snapshot);
};

export const getAssetsData = (records: SnapshotRecords) => {
    return Object.entries(records)
        .filter(([key]) => key === "assets")
        .map(([, snapshot]) => snapshot.prices)[0];
};

export const getFirstAndLastSnapshot = (snapshots: Array<Snapshot>) => {
    return {
        first: snapshots[0],
        last: snapshots[snapshots.length - 1],
    };
};

export const getAmountsFromSnapshot = (
    snapshot: Snapshot,
    type: TrackerType,
) => {
    return snapshot[type === TrackerType.Volume ? "volume" : "locked"];
};

export const getAmountsForChain = (
    amounts: Array<SnapshotAmount>,
    chain: TrackerChain,
) => {
    return amounts.filter((entry) => entry.chain === chain);
};

export const getChainAmountsFromSnapshot = (
    snapshot: Snapshot,
    type: TrackerType,
    chain: TrackerChain,
) => {
    const amounts = getAmountsFromSnapshot(snapshot, type);
    return getAmountsForChain(amounts, chain);
};

export enum TokenCurrency {
    TokenNative = "TokenNative",
}

const getAmount = (
    entry: SnapshotAmount,
    currency: TokenCurrency | Currency,
    assetsData: Array<SnapshotAssetData>,
    tokenPrices: TokenPrices,
) => {
    if (currency === TokenCurrency.TokenNative) {
        return entry.amount;
    }
    if (snapshotCurrencies.includes(currency)) {
        switch (currency) {
            case Currency.USD:
                return entry.amountInUsd;
            case Currency.BTC:
                return entry.amountInBtc;
            case Currency.ETH:
                return entry.amountInEth;
        }
    }
    // const decimals =
    //     assetsData.find((data) => data.asset === entry.asset)?.decimals || 0;
    // const amount = new BigNumber(entry.amount).shiftedBy(-decimals);

    const rate = getConversionRate(Currency.USD, currency, tokenPrices);
    const converted = new BigNumber(entry.amountInUsd).multipliedBy(rate);
    return converted.toString();
};

const sumSnapshotAmounts = (
    snapshot: Snapshot,
    type: TrackerType,
    chain: TrackerChain,
    currency: TokenCurrency | Currency,
    assetData: Array<SnapshotAssetData>,
    tokenPrices: TokenPrices,
) => {
    const chainAmounts = getChainAmountsFromSnapshot(snapshot, type, chain);
    return chainAmounts.reduce(
        (acc, curr) =>
            acc.plus(getAmount(curr, currency, assetData, tokenPrices)),
        new BigNumber(0),
    );
};

const getVolumeData = (
    start: Snapshot,
    end: Snapshot,
    type: TrackerType,
    chain: TrackerChain,
    currency: TokenCurrency | Currency,
    assetsData: Array<SnapshotAssetData>,
    tokenPrices: TokenPrices,
) => {
    const summedStart = sumSnapshotAmounts(
        start,
        type,
        chain,
        currency,
        assetsData,
        tokenPrices,
    );
    const summedEnd = sumSnapshotAmounts(
        end,
        type,
        chain,
        currency,
        assetsData,
        tokenPrices,
    );
    const difference = summedEnd.minus(summedStart);
    const startAmounts = getChainAmountsFromSnapshot(start, type, chain);
    const endAmounts = getChainAmountsFromSnapshot(end, type, chain);

    return { difference, startAmounts, endAmounts };
};

export const snapshotDataToVolumeData = (
    data: SnapshotRecords,
    type: TrackerType,
    chain: TrackerChain,
    currency: TokenCurrency | Currency,
    tokenPrices: TokenPrices,
) => {
    const snapshots = getSnapshots(data);
    console.log("snapshots", snapshots);
    const { first, last } = getFirstAndLastSnapshot(snapshots);
    console.log("first last", first, last);
    const assetsData = getAssetsData(data);
    const { difference, startAmounts, endAmounts } = getVolumeData(
        first,
        last,
        type,
        chain,
        currency,
        assetsData,
        tokenPrices,
    );
    console.log("first last amounts", startAmounts, endAmounts);
    const assets = assetsData.map((entry) => entry.asset);
    console.log("tokens", assets);
    const amountRecords: BigNumberRecord = {};
    assets.forEach((asset) => {
        const lastEntry = endAmounts.find((entry) => entry.asset === asset);
        const firstEntry = startAmounts.find((entry) => entry.asset === asset);
        let difference = new BigNumber(0);
        if (lastEntry && firstEntry) {
            difference = new BigNumber(
                getAmount(lastEntry, currency, assetsData, tokenPrices),
            ).minus(getAmount(firstEntry, currency, assetsData, tokenPrices));
        } else if (lastEntry) {
            difference = new BigNumber(
                getAmount(lastEntry, currency, assetsData, tokenPrices),
            );
        }
        if (currency === TokenCurrency.TokenNative) {
            const assetData = assetsData.find((entry) => entry.asset === asset);
            const decimals = assetData?.decimals || 0;
            difference = difference.shiftedBy(-decimals);
        }
        amountRecords[asset] = difference;
    });
    console.log("amounts", unifyTokenRecords(amountRecords));
    return { amountRecords, difference };
};

export const snapshotDataToTimeSeries = (
    data: SnapshotRecords,
    type: TrackerType,
    chain: TrackerChain,
    currency: Currency,
    tokenPrices: TokenPrices,
) => {
    const snapshots = getSnapshots(data);
    const assetsData = getAssetsData(data);
    const points = snapshots.map((snapshot) => {
        const timestamp = snapshot.timestamp;
        const value = sumSnapshotAmounts(
            snapshot,
            type,
            chain,
            currency,
            assetsData,
            tokenPrices,
        ).toNumber();
        return [timestamp * 1000, value];
    });
    console.log("points", points);
    return points as Array<[number, number]>;
};
