import BigNumber from "bignumber.js";
import moment from "moment";

import { ApolloClient, gql } from "@apollo/react-hooks";
import { RenNetwork } from "@renproject/interfaces";
import { Currency } from "@renproject/react-components";

import { convertTokenAmount, getConversionRate } from "../../../controllers/common/tokenBalanceUtils";
import { ChainOption } from "../../../controllers/pages/networkStatsPage/ChainSelector";
import { TokenPrices } from "../../ethereum/tokens";
import { convertToStandardAmount } from "../../general/tokenAmountUtils";
import { DEFAULT_REN_NETWORK } from "../../react/environmentVariables";
import { PeriodOption } from "../volumes";
import { TokenSupplies } from "../../../controllers/pages/networkStatsPage/VolumeDataContainer";
import { getTokenSupply } from "../../../controllers/pages/networkStatsPage/VolumeData";

const HISTORIC_RESOLUTION = 50;

export enum TrackerChain {
    Ethereum = "Ethereum",
    BinanceSmartChain = "BinanceSmartChain",
    Polygon = "Polygon",
    Fantom = "Fantom",
    Avalanche = "Avalanche",
    Solana = "Solana",
    Arbitrum = "Arbitrum",
}

export const allTrackedChains: Array<TrackerChain> = [
    TrackerChain.Ethereum,
    TrackerChain.BinanceSmartChain,
    TrackerChain.Fantom,
    TrackerChain.Polygon,
    TrackerChain.Avalanche,
    TrackerChain.Solana,
    TrackerChain.Arbitrum,
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
        case ChainOption.Arbitrum:
            return TrackerChain.Arbitrum;
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
    timestamp: number;
    locked: Array<SnapshotAmount>;
    volume: Array<SnapshotAmount>;
    prices: Array<SnapshotAssetData>;
};

export type BigNumberRecord = Record<
    string,
    { amount: BigNumber; standardAmount: BigNumber; quote: BigNumber }
>;

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
        : buildRenVmTrackerQuery(period, DEFAULT_REN_NETWORK);
    return client.query<SnapshotRecords>({
        query,
    });
};

export const buildRenVmTrackerQuery = (
    period: PeriodOption,
    network: RenNetwork,
) => {
    const timespan = getPeriodTimespanInSeconds(period, network);
    const interval = timespan / HISTORIC_RESOLUTION;

    const endTimestamp = getResolutionEndTimestamp();

    const subQueries = Array.from(new Array(HISTORIC_RESOLUTION)).map(
        (_, i) => {
            const timestamp = Math.ceil(endTimestamp - i * interval);
            return getSnapshotSubQuery(timestamp.toString());
        },
    );

    const snapshotQuery = `
        ${VOLUMES_FRAGMENT}
        query GetSnapshots {
            assets: Snapshot(timestamp: "${endTimestamp}"){
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

const buildRenVmTrackerUpdateQuery = (timestamp: number) => {
    const snapshotQuery = `
        ${VOLUMES_FRAGMENT}
        query GetSnapshots {
            ${getSnapshotSubQuery(timestamp.toString())}
        }
    `;
    return gql(snapshotQuery);
};

const getNetworkStart = (renNetwork: RenNetwork) => {
    if (renNetwork === RenNetwork.Mainnet) {
        return "2020-05-27T00+00";
    } else {
        return "2020-06-20T00+00";
    }
};

// TODO: Why use
// const getResolutionInterval = (period: PeriodOption) => {
//     switch (period) {
//         case PeriodOption.HOUR:
//             return 80;
//         case PeriodOption.DAY:
//             return 30 * 60;
//         case PeriodOption.WEEK:
//             return 2 * 3600;
//         case PeriodOption.MONTH:
//             return 12 * 3600;
//         case PeriodOption.YEAR:
//             return 5 * 24 * 3600;
//         case PeriodOption.ALL:
//             return 6 * 24 * 3600;
//     }
//     return 5 * 24 * 3600;
// };

const getPeriodTimespanInSeconds = (
    period: PeriodOption,
    renNetwork: RenNetwork,
): number => {
    const minutes = 60; // 60 seconds
    const hours = 60 * minutes;
    const days = 24 * hours;
    const weeks = 7 * days;
    const months = 31 * days;
    const years = 365 * days;

    switch (period) {
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
            return Math.floor(
                moment().diff(getNetworkStart(renNetwork)) / 1000,
            );
        default:
            throw new Error(`Unknown period type ${period}`);
    }
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

const getAssetsData = (records: SnapshotRecords) => {
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

const getAmountsFromSnapshot = (
    snapshot: Snapshot,
    type: TrackerVolumeType,
) => {
    return snapshot[
        type === TrackerVolumeType.Transacted ? "volume" : "locked"
    ];
};

const getAmountsForChain = (
    amounts: Array<SnapshotAmount>,
    chain: TrackerChain,
) => {
    return amounts.filter((entry) => entry.chain === chain);
};

const getChainAmountsFromSnapshot = (
    snapshot: Snapshot,
    type: TrackerVolumeType,
    chain: TrackerChain,
) => {
    const amounts = getAmountsFromSnapshot(snapshot, type);
    return getAmountsForChain(amounts, chain);
};

enum TokenAmountType {
    BaseUnits = "BaseUnits",
    StandardUnits = "StandardUnits",
}

const getQuoteAmount = (
    entry: SnapshotAmount,
    currency: TokenAmountType | Currency,
    assetsData: Array<SnapshotAssetData>,
    tokenPrices: TokenPrices,
): BigNumber => {
    if (currency === TokenAmountType.BaseUnits) {
        return new BigNumber(entry.amount);
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
                return new BigNumber(entry.amountInUsd);
            case Currency.BTC:
                return new BigNumber(entry.amountInBtc);
            case Currency.ETH:
                return new BigNumber(entry.amountInEth);
        }
    }

    const rate = getConversionRate(Currency.USD, currency, tokenPrices);
    const converted = new BigNumber(entry.amountInUsd).multipliedBy(rate);
    return converted;
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
            acc.plus(getQuoteAmount(curr, currency, assetData, tokenPrices)),
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
    period: PeriodOption,
    tokenSupplies: TokenSupplies,
    lockedMode = false
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
    let aggregatedQuote = new BigNumber(0);

    const assets = assetsData.map((entry) => entry.asset);
    const amountRecords: BigNumberRecord = {};
    assets.forEach((asset) => {
        const lastEntry = endAmounts.find((entry) => entry.asset === asset);
        const firstEntry = startAmounts.find((entry) => entry.asset === asset);
        let difference = new BigNumber(0);
        let differenceStandard = new BigNumber(0);
        let differenceQuote = new BigNumber(0);
        if (lockedMode) {
            const tokenSupply = getTokenSupply(tokenSupplies, chain, asset);
            if(tokenSupply !== null) {
                difference = new BigNumber(
                    tokenSupply
                )
                const decimals =
                    assetsData.find((data) => data.asset === asset)?.decimals ||
                    0;
                differenceStandard = new BigNumber(tokenSupply).shiftedBy(-decimals);
                differenceQuote = convertTokenAmount(differenceStandard, asset as any, currency as Currency, tokenPrices);
            } else if (lastEntry) {
                differenceQuote = new BigNumber(
                    getQuoteAmount(lastEntry, currency, assetsData, tokenPrices),
                );
                differenceStandard = new BigNumber(
                    getQuoteAmount(
                        lastEntry,
                        TokenAmountType.BaseUnits,
                        assetsData,
                        tokenPrices,
                    ),
                );
                differenceStandard = new BigNumber(
                    getQuoteAmount(
                        lastEntry,
                        TokenAmountType.StandardUnits,
                        assetsData,
                        tokenPrices,
                    ),
                );
            }
        }
        else if (lastEntry && firstEntry && period !== PeriodOption.ALL) {
            differenceQuote = new BigNumber(
                getQuoteAmount(lastEntry, currency, assetsData, tokenPrices),
            ).minus(
                getQuoteAmount(firstEntry, currency, assetsData, tokenPrices),
            );
            difference = new BigNumber(
                getQuoteAmount(
                    lastEntry,
                    TokenAmountType.BaseUnits,
                    assetsData,
                    tokenPrices,
                ),
            ).minus(
                getQuoteAmount(
                    firstEntry,
                    TokenAmountType.BaseUnits,
                    assetsData,
                    tokenPrices,
                ),
            );
            differenceStandard = new BigNumber(
                getQuoteAmount(
                    lastEntry,
                    TokenAmountType.StandardUnits,
                    assetsData,
                    tokenPrices,
                ),
            ).minus(
                getQuoteAmount(
                    firstEntry,
                    TokenAmountType.StandardUnits,
                    assetsData,
                    tokenPrices,
                ),
            );
        } else if (lastEntry) {
            differenceQuote = new BigNumber(
                getQuoteAmount(lastEntry, currency, assetsData, tokenPrices),
            );
            differenceStandard = new BigNumber(
                getQuoteAmount(
                    lastEntry,
                    TokenAmountType.BaseUnits,
                    assetsData,
                    tokenPrices,
                ),
            );
            differenceStandard = new BigNumber(
                getQuoteAmount(
                    lastEntry,
                    TokenAmountType.StandardUnits,
                    assetsData,
                    tokenPrices,
                ),
            );
        }
        aggregatedQuote = aggregatedQuote.plus(differenceQuote);

        amountRecords[asset] = {
            quote: differenceQuote,
            standardAmount: differenceStandard,
            amount: difference,
        };
    });

    return { amountRecords, difference, aggregatedQuote };
};

const mergeAmountRecords = (
    assetsData: any,
    acc: BigNumberRecord,
    curr: BigNumberRecord,
) => {
    let records: BigNumberRecord = {};
    assetsData.forEach((assetData: SnapshotAssetData) => {
        const token = assetData.asset;
        records[token] = {
            quote: (acc[token] ? acc[token].quote : new BigNumber(0)).plus(
                curr[token] ? curr[token].quote : new BigNumber(0),
            ),
            amount: (acc[token] ? acc[token].amount : new BigNumber(0)).plus(
                curr[token] ? curr[token].amount : new BigNumber(0),
            ),
            standardAmount: (acc[token]
                ? acc[token].standardAmount
                : new BigNumber(0)
            ).plus(curr[token] ? curr[token].standardAmount : new BigNumber(0)),
        };
    });
    return records;
};

export const snapshotDataToAllChainVolumeData = (
    data: SnapshotRecords,
    type: TrackerVolumeType,
    currency: TokenAmountType | Currency,
    tokenPrices: TokenPrices,
    period: PeriodOption,
    tokenSupplies: TokenSupplies,
    lockedMode = false
) => {
    const assetsData = getAssetsData(data);
    let sum = new BigNumber(0);
    let sumQuote = new BigNumber(0);
    let records: BigNumberRecord = {};
    allTrackedChains.forEach((chain) => {
        const { difference, aggregatedQuote, amountRecords } = snapshotDataToVolumeData(
            data,
            type,
            chain,
            currency,
            tokenPrices,
            period,
            tokenSupplies,
            lockedMode
        );

        sum = sum.plus(difference);
        sumQuote = sumQuote.plus(aggregatedQuote);

        records = mergeAmountRecords(assetsData, records, amountRecords);
    });

    return { difference: sum, aggregatedQuote: sumQuote, amountRecords: records };
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
        ).decimalPlaces(0);
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
        const sum = allTrackedChains
            .reduce((sum, chain) => {
                const value = sumSnapshotAmounts(
                    snapshot,
                    type,
                    chain,
                    currency,
                    assetsData,
                    tokenPrices,
                );
                return sum.plus(value);
            }, new BigNumber(0))
            .decimalPlaces(0);
        return [timestamp * 1000, sum.toNumber()];
    });
    return points as Array<[number, number]>;
};
