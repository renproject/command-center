import { ApolloClient, gql } from "@apollo/react-hooks";
import { Currency } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { NetworkStatsChain } from "../../../controllers/pages/networkStatsPage/networkStatsContainer";
import { TokenPrices } from "../../ethereum/tokens";
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
};

type SnapshotPrice = {
    asset: string;
    decimals: number;
    priceInUsd: number;
};

type Snapshot = {
    id: string;
    timestamp: number;
    locked: Array<SnapshotAmount>;
    volume: Array<SnapshotAmount>;
    prices: Array<SnapshotPrice>;
};

export type BigNumberRecord = Record<string, BigNumber>;

export type SnapshotRecord = Record<string, Snapshot>;

interface SnapshotResponse {
    data: SnapshotRecord;
}

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
        }
    }
`;

const LOCKED_FRAGMENT = `
    fragment LockedSnapshot on Snapshot {
        id
        timestamp
        prices {
            asset,
            decimals
        },
        locked {
            asset
            chain
            amount
            amountInUsd
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
    return client.query<SnapshotRecord>({
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
            assets: Snapshot(timestamp: "1627221600"){
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

export const getSnapshots = (records: SnapshotRecord) => {
    return Object.entries(records)
        .filter(([key]) => key !== "assets")
        .map(([, snapshot]) => snapshot);
};

export const getAssetData = (records: SnapshotRecord) => {
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

export enum AmountKind {
    Usd = "Usd",
    Token = "Token",
}

const getAmount = (entry: SnapshotAmount, kind: AmountKind) => {
    return kind === AmountKind.Usd ? entry.amountInUsd : entry.amount;
};

const sumSnapshotAmounts = (
    snapshot: Snapshot,
    type: TrackerType,
    chain: TrackerChain,
    kind: AmountKind,
) => {
    if (kind === AmountKind.Usd) {
        const amounts = getAmountsFromSnapshot(snapshot, type);
        const chainAmounts = getAmountsForChain(amounts, chain);
        return chainAmounts.reduce(
            (acc, curr) => acc.plus(curr.amountInUsd),
            new BigNumber(0),
        );
    }
    return new BigNumber(1);
};

const getVolumeData = (
    start: Snapshot,
    end: Snapshot,
    type: TrackerType,
    chain: TrackerChain,
    amountKind: AmountKind,
) => {
    const summedStart = sumSnapshotAmounts(start, type, chain, amountKind);
    const summedEnd = sumSnapshotAmounts(end, type, chain, amountKind);
    const difference = summedEnd.minus(summedStart);
    const startAmountsAll = getAmountsFromSnapshot(start, type);
    const startAmounts = getAmountsForChain(startAmountsAll, chain);
    const endAmountsAll = getAmountsFromSnapshot(end, type);
    const endAmounts = getAmountsForChain(endAmountsAll, chain);

    return { difference, startAmounts, endAmounts };
};

export const snapshotDataToVolumeData = (
    data: SnapshotRecord,
    type: TrackerType,
    chain: TrackerChain,
    amountKind = AmountKind.Usd,
) => {
    const snapshots = getSnapshots(data);
    console.log("snapshots", snapshots);
    const { first, last } = getFirstAndLastSnapshot(snapshots);
    console.log("first last", first, last);
    const { difference, startAmounts, endAmounts } = getVolumeData(
        first,
        last,
        type,
        chain,
        amountKind,
    );
    console.log("first last amounts", startAmounts, endAmounts);
    const assetsData = getAssetData(data);
    const assets = assetsData.map((entry) => entry.asset);
    console.log("tokens", assets);
    const amountRecords: BigNumberRecord = {};
    assets.forEach((asset) => {
        const lastEntry = endAmounts.find((entry) => entry.asset === asset);
        const firstEntry = startAmounts.find((entry) => entry.asset === asset);
        let difference = new BigNumber(0);
        if (lastEntry && firstEntry) {
            difference = new BigNumber(getAmount(lastEntry, amountKind)).minus(
                getAmount(firstEntry, amountKind),
            );
        } else if (lastEntry) {
            difference = new BigNumber(getAmount(lastEntry, amountKind));
        }
        if (amountKind === AmountKind.Token) {
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
    data: SnapshotRecord,
    type: TrackerType,
    chain: TrackerChain,
    amountKind = AmountKind.Usd,
) => {
    const snapshots = getSnapshots(data);
    const points = snapshots.map((snapshot, index) => {
        const timestamp = snapshot.timestamp;
        const value = sumSnapshotAmounts(
            snapshot,
            type,
            chain,
            amountKind,
        ).toNumber();
        return [timestamp * 1000, value];
    });
    console.log("points", points);
    return points as Array<[number, number]>;
};
