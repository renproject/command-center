import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";

import { GraphClientContainer } from "../lib/graphQL/ApolloWithNetwork";
import {
    queryRenVmTracker,
    TrackerType,
} from "../lib/graphQL/queries/renVmTracker";
import { getPeriodTimespan, PeriodType } from "../lib/graphQL/volumes";

const useTrackerContainer = () => {
    const { renVmTracker } = GraphClientContainer.useContainer();

    const [volumeData, setVolumeData] = useState<any>({});
    const [volumeLoading, setVolumeLoading] = useState(false);
    const [volumePeriod, setVolumePeriod] = useState<PeriodType>(
        PeriodType.ALL,
    );

    const [lockedData, setLockedData] = useState<any>({});
    const [lockedLoading, setLockedLoading] = useState(false);
    const [lockedPeriod, setLockedPeriod] = useState<PeriodType>(
        PeriodType.ALL,
    );

    useEffect(() => {
        setVolumeLoading(true);
        queryRenVmTracker(renVmTracker, TrackerType.Volume, volumePeriod)
            .then((data) => {
                console.log("data", data);
                setVolumeData(data);
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
