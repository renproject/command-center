import { ApolloClient, gql } from "@apollo/react-hooks";
import BigNumber from "bignumber.js";
import { NetworkStatsChain } from "../../../controllers/pages/networkStatsPage/networkStatsContainer";
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

type Snapshot = {
    id: string;
    timestamp: number;
    locked: Array<SnapshotAmount>;
    volume: Array<SnapshotAmount>;
    //prices
};

export type BigNumberRecord = Record<string, BigNumber>;

export type SnapshotRecord = Record<string, Snapshot>;

interface SnapshotResponse {
    data: SnapshotRecord;
}

export enum TrackerType {
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
            ${subQueries.reverse().join(",")}
        }
    `;
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
    return Object.entries(records).map(([, snapshot]) => snapshot);
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

export const getDistinctAssets = (entries: Array<SnapshotAmount>) => {
    return entries
        .map((entry) => entry.asset)
        .filter((value, index, self) => self.indexOf(value) === index);
};

export const snapshotDataToTokenAmounts = (
    data: SnapshotRecord,
    type: TrackerType,
    chain: TrackerChain,
) => {
    const snapshots = getSnapshots(data);
    console.log("snapshots", snapshots);
    const { first, last } = getFirstAndLastSnapshot(snapshots);
    console.log("first last", first, last);
    const firstAmounts = getAmountsFromSnapshot(first, type);
    const firstChainAmounts = getAmountsForChain(firstAmounts, chain);
    const lastAmounts = getAmountsFromSnapshot(last, type);
    const lastChainAmounts = getAmountsForChain(lastAmounts, chain);
    console.log("first last amounts", firstChainAmounts, lastChainAmounts);
    const assets = getDistinctAssets(
        lastChainAmounts.concat(firstChainAmounts),
    );
    console.log("tokens", assets);
    const amounts: BigNumberRecord = {};
    assets.forEach((asset) => {
        const lastEntry = lastChainAmounts.find(
            (entry) => entry.asset === asset,
        );
        const firstEntry = firstChainAmounts.find(
            (entry) => entry.asset === asset,
        );
        let difference = new BigNumber(0);
        if (lastEntry && firstEntry) {
            difference = new BigNumber(lastEntry.amount).minus(
                firstEntry.amount,
            );
        }

        amounts[asset] = difference;
    });
    console.log("amounts", amounts);
    return amounts;
};
