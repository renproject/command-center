import { ApolloClient, gql } from "@apollo/react-hooks";
import { getPeriodTimespan, PeriodType, VolumeNetwork } from "../volumes";

const QUERY_TRACKER_LOCKED = gql`
    query GetLockedSnapshots($start: String, $end: String) {
        prev: Snapshot(timestamp: $start) {
            id
            timestamp
            locked {
                asset
                chain
                amount
                amountInUsd
            }
        }
        next: Snapshot(timestamp: $end) {
            id
            timestamp
            locked {
                asset
                chain
                amount
                amountInUsd
            }
        }
    }
`;

const QUERY_TRACKER_VOLUME = gql`
    query GetSnapshots($start: String, $end: String) {
        prev: Snapshot(timestamp: $start) {
            id
            timestamp
            volume {
                asset
                chain
                amount
                amountInUsd
            }
        }
        next: Snapshot(timestamp: $end) {
            id
            timestamp
            volume {
                asset
                chain
                amount
                amountInUsd
            }
        }
    }
`;

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
        volume {
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

type TrackerAmount = {
    asset: string;
    chain: string;
    amount: string;
    amountInUsd: string;
};

interface Snapshot {
    id: string;
    timestamp: number;
    locked: Array<TrackerAmount>;
    volume: Array<TrackerAmount>;
}

interface TrackerData {
    prices: any;
}

export enum TrackerType {
    Locked = "locked",
    Volume = "volume",
}

export const queryRenVmTracker = async (
    client: ApolloClient<object>,
    type: TrackerType,
    period: PeriodType,
): Promise<any> => {
    const query = buildRenVmTrackerQuery(type, period);
    return client.query<TrackerData>({
        query,
    } as any);
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
    return gql`
        ${type === TrackerType.Volume ? VOLUME_FRAGMENT : LOCKED_FRAGMENT}
        query GetSnapshots {
            ${subQueries.join(",")}
        }
    `;
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
