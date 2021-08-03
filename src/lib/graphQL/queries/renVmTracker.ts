import { ApolloClient, gql } from "@apollo/react-hooks";
import { Asset } from "@renproject/interfaces";
import { Currency } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { getConversionRate } from "../../../controllers/common/tokenBalanceUtils";
import { ChainOption } from "../../../controllers/pages/networkStatsPage/ChainSelector";
import { TokenPrices } from "../../ethereum/tokens";
import { convertToStandardAmount } from "../../general/tokenAmountUtils";
import { getPeriodTimespan, PeriodOption } from "../volumes";

export enum TrackerChain {
    Ethereum = "Ethereum",
    BinanceSmartChain = "BinanceSmartChain",
    Polygon = "Polygon",
    Fantom = "Fantom",
    Avalanche = "Avalanche",
    Solana = "Solana",
}

const allTrackedChains: Array<TrackerChain> = [
    TrackerChain.Ethereum,
    TrackerChain.BinanceSmartChain,
    TrackerChain.Fantom,
    TrackerChain.Polygon,
    TrackerChain.Avalanche,
    TrackerChain.Solana,
];

export const chainOptionToTrackerChain = (chain: ChainOption) => {
    switch (chain) {
        case ChainOption.Ethereum:
            return TrackerChain.Ethereum;
        case ChainOption.BinanceSmartChain:
            return TrackerChain.BinanceSmartChain;
        case ChainOption.Fantom:
            return TrackerChain.Fantom;
        case ChainOption.Polygon:
            return TrackerChain.Polygon;
        case ChainOption.Avalanche:
            return TrackerChain.Avalanche;
        case ChainOption.Solana:
            return TrackerChain.Solana;
        case ChainOption.Avalanche:
            return TrackerChain.Avalanche;
        default:
            return TrackerChain.Ethereum;
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

const snapshotCurrencies: Array<Currency | TokenAmountType> = [
    Currency.USD,
    Currency.BTC,
    Currency.ETH,
];

export enum TrackerVolumeType { // rename to SnapshotType
    Locked = "locked",
    Transacted = "transacted",
}

const FRAGMENT_VOLUME_FIELDS = `
            asset
            chain
            amount
            amountInUsd
            amountInBtc
            amountInEth
`;

const VOLUMES_FRAGMENT = `
    fragment VolumesSnapshot on Snapshot {
        id
        timestamp
        volume {
            ${FRAGMENT_VOLUME_FIELDS}
        }
        locked {
            ${FRAGMENT_VOLUME_FIELDS}
        }
    }
`;

const getSnapshotSubQuery = (timestamp: string) => `
    s${timestamp}: Snapshot(timestamp: "${timestamp}") {
        ...VolumesSnapshot
    }`;

export const queryRenVmTracker = async (
    client: ApolloClient<object>,
    type: TrackerVolumeType,
    period: PeriodOption,
    isUpdate = false,
): Promise<SnapshotResponse> => {
    const query = isUpdate
        ? buildRenVmTrackerUpdateQuery(getResolutionEndTimestamp())
        : buildRenVmTrackerQuery(period);
    return client.query<SnapshotRecords>({
        query,
    });
};

export const buildRenVmTrackerQuery = (period: PeriodOption) => {
    const interval = getResolutionInterval(period);
    const points = getResolutionPoints(period);
    const endTimestamp = getResolutionEndTimestamp();

    const subQueries = [];
    for (let i = 0; i < points; i++) {
        const timestamp = Math.ceil(endTimestamp - i * interval);
        const subQuery = getSnapshotSubQuery(timestamp.toString());
        subQueries.push(subQuery);
    }

    const snapshotQuery = `
        ${VOLUMES_FRAGMENT}
        query GetSnapshots {
            assets: Snapshot(timestamp: "${endTimestamp}"){
                id,
                timestamp,
                prices {
                    asset,
                    decimals
                }
            },
            ${subQueries.reverse().join(",")}
        }
    `;
    return gql(snapshotQuery);
};

export const buildRenVmTrackerUpdateQuery = (timestamp: number) => {
    const snapshotQuery = `
        ${VOLUMES_FRAGMENT}
        query GetSnapshots {
            ${getSnapshotSubQuery(timestamp.toString())}
        }
    `;
    return gql(snapshotQuery);
};

export const getResolutionPoints = (period: PeriodOption) => {
    const timespan = getPeriodTimespan(period);
    const interval = getResolutionInterval(period);
    return timespan / interval;
};

export const getResolutionInterval = (period: PeriodOption) => {
    switch (period) {
        case PeriodOption.HOUR:
            return 80;
        case PeriodOption.DAY:
            return 30 * 60;
        case PeriodOption.WEEK:
            return 2 * 3600;
        case PeriodOption.MONTH:
            return 12 * 3600;
        case PeriodOption.YEAR:
            return 5 * 24 * 3600;
        case PeriodOption.ALL:
            return 6 * 24 * 3600;
    }
    return 5 * 24 * 3600;
};

export const getResolutionEndTimestamp = (
    resolution = 80,
    date = Date.now(),
) => {
    // "round" timestamp to {resolution} seconds
    const seconds = Math.floor(date / 1000);
    const remainder = seconds % resolution;
    return seconds - remainder;
};

export const getSnapshots = (records: SnapshotRecords) => {
    return Object.entries(records)
        .filter(([key]) => key !== "assets")
        .map(([, snapshot]) => snapshot);
};

export const getAssetsData = (records: SnapshotRecords) => {
    return Object.entries(records)
        .filter(([key]) => key === "assets")
        .map(([, snapshot]) => snapshot.prices)[0]
        .filter((entry) => entry.asset !== "System");
};

export const getFirstAndLastSnapshot = (snapshots: Array<Snapshot>) => {
    return {
        first: snapshots[0],
        last: snapshots[snapshots.length - 1],
    };
};

export const getAmountsFromSnapshot = (
    snapshot: Snapshot,
    type: TrackerVolumeType,
) => {
    return snapshot[
        type === TrackerVolumeType.Transacted ? "volume" : "locked"
    ];
};

export const getAmountsForChain = (
    amounts: Array<SnapshotAmount>,
    chain: TrackerChain,
) => {
    return amounts.filter((entry) => entry.chain === chain);
};

export const getChainAmountsFromSnapshot = (
    snapshot: Snapshot,
    type: TrackerVolumeType,
    chain: TrackerChain,
) => {
    const amounts = getAmountsFromSnapshot(snapshot, type);
    return getAmountsForChain(amounts, chain);
};

export enum TokenAmountType {
    BaseUnits = "BaseUnits",
    StandardUnits = "StandardUnits",
}

const getAmount = (
    entry: SnapshotAmount,
    currency: TokenAmountType | Currency,
    assetsData: Array<SnapshotAssetData>,
    tokenPrices: TokenPrices,
) => {
    if (currency === TokenAmountType.BaseUnits) {
        return entry.amount;
    }

    if (currency === TokenAmountType.StandardUnits) {
        const decimals =
            assetsData.find((data) => data.asset === entry.asset)?.decimals ||
            0;
        return convertToStandardAmount(entry.amount, decimals);
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

    const rate = getConversionRate(Currency.USD, currency, tokenPrices);
    const converted = new BigNumber(entry.amountInUsd).multipliedBy(rate);
    return converted.toString();
};

const sumSnapshotAmounts = (
    snapshot: Snapshot,
    type: TrackerVolumeType,
    chain: TrackerChain,
    currency: TokenAmountType | Currency,
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
    type: TrackerVolumeType,
    chain: TrackerChain,
    currency: TokenAmountType | Currency,
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
    type: TrackerVolumeType,
    chain: TrackerChain,
    currency: TokenAmountType | Currency,
    tokenPrices: TokenPrices,
) => {
    const snapshots = getSnapshots(data);
    const { first, last } = getFirstAndLastSnapshot(snapshots);
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

    const assets = assetsData.map((entry) => entry.asset);
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

        amountRecords[asset] = difference;
    });

    return { amountRecords, difference };
};

const mergeAmountRecords = (
    assetsData: any,
    acc: BigNumberRecord,
    curr: BigNumberRecord,
) => {
    let records: BigNumberRecord = {};
    assetsData.forEach((assetData: SnapshotAssetData) => {
        const token = assetData.asset;
        records[token] = new BigNumber(acc[token] || 0).plus(curr[token] || 0);
    });
    return records;
};

export const snapshotDataToAllChainVolumeData = (
    data: SnapshotRecords,
    type: TrackerVolumeType,
    currency: TokenAmountType | Currency,
    tokenPrices: TokenPrices,
) => {
    const assetsData = getAssetsData(data);
    let sum = new BigNumber(0);
    let records: BigNumberRecord = {};
    allTrackedChains.forEach((chain) => {
        const { difference, amountRecords } = snapshotDataToVolumeData(
            data,
            type,
            chain,
            currency,
            tokenPrices,
        );
        sum = sum.plus(difference);
        records = mergeAmountRecords(assetsData, records, amountRecords);
    });
    return { difference: sum, amountRecords: records };
};

export const snapshotDataToTimeSeries = (
    data: SnapshotRecords,
    type: TrackerVolumeType,
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
        );
        return [timestamp * 1000, value.toNumber()];
    });
    return points as Array<[number, number]>;
};

export const snaphostDataToAllChainTimeSeries = (
    data: SnapshotRecords,
    type: TrackerVolumeType,
    currency: Currency,
    tokenPrices: TokenPrices,
) => {
    const snapshots = getSnapshots(data);
    const assetsData = getAssetsData(data);
    const points = snapshots.map((snapshot) => {
        const timestamp = snapshot.timestamp;
        let sum = new BigNumber(0);
        allTrackedChains.forEach((chain) => {
            const value = sumSnapshotAmounts(
                snapshot,
                type,
                chain,
                currency,
                assetsData,
                tokenPrices,
            );
            sum = sum.plus(value);
        });
        return [timestamp * 1000, sum.toNumber()];
    });
    return points as Array<[number, number]>;
};
