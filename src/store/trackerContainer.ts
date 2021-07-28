import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";

import { GraphClientContainer } from "../lib/graphQL/ApolloWithNetwork";
import {
    queryRenVmTracker,
    SnapshotRecords,
    TrackerType,
} from "../lib/graphQL/queries/renVmTracker";
import { PeriodType } from "../lib/graphQL/volumes";

const useTrackerContainer = () => {
    const { renVmTracker } = GraphClientContainer.useContainer();

    const [volumeData, setVolumeData] = useState<SnapshotRecords>({});
    const [volumeLoading, setVolumeLoading] = useState(true);
    const [volumePeriod, setVolumePeriod] = useState<PeriodType>(
        PeriodType.ALL,
    );

    const [lockedData, setLockedData] = useState<SnapshotRecords>({});
    const [lockedLoading, setLockedLoading] = useState(true);
    const [lockedPeriod, setLockedPeriod] = useState<PeriodType>(
        PeriodType.ALL,
    );

    useEffect(() => {
        setVolumeLoading(true);
        queryRenVmTracker(renVmTracker, TrackerType.Volume, volumePeriod)
            .then((response) => {
                setVolumeData(response.data);
                setVolumeLoading(false);
            })
            .catch(console.error);
    }, [volumePeriod]);

    return {
        volumeData,
        setVolumeData,
        volumeLoading,
        setVolumeLoading,
        volumePeriod,
        setVolumePeriod,
        lockedData,
        setLockedData,
        lockedLoading,
        setLockedLoading,
        lockedPeriod,
        setLockedPeriod,
    };
};

export const TrackerContainer = createContainer(useTrackerContainer);
