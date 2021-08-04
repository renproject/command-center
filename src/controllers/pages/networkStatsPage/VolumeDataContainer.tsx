import { OrderedMap } from "immutable";
import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";

import { GraphClientContainer } from "../../../lib/graphQL/ApolloWithNetwork";
import {
    queryRenVmTracker,
    SnapshotRecords,
    TrackerVolumeType,
} from "../../../lib/graphQL/queries/renVmTracker";
import { PeriodOption } from "../../../lib/graphQL/volumes";
import { updateVolumeData } from "./VolumeData";

// Re-fetch the volume stats every 10 minutes. If mints and burns become more
// frequent in the future, this could be made more frequent.
const VOLUME_REFRESH_PERIOD = 10 * 60 * 1000;

export const useVolumeData = () => {
    const type = TrackerVolumeType.Locked; // TODO: remove
    const { renVmTracker } = GraphClientContainer.useContainer();

    const [volumeDataMap, setVolumeDataMap] = useState<
        OrderedMap<PeriodOption, SnapshotRecords>
    >(OrderedMap());
    const [volumePeriod, setVolumePeriod] = useState<PeriodOption>(
        PeriodOption.ALL,
    );
    const [volumeError, setVolumeError] = useState(false);

    const volumeData = volumeDataMap.get(volumePeriod);

    useEffect(() => {
        setVolumeError(false);

        if (!volumeData) {
            queryRenVmTracker(renVmTracker, type, volumePeriod)
                .then((response: any) => {
                    setVolumeDataMap((map) =>
                        map.set(volumePeriod, response.data),
                    );
                })
                .catch((error) => {
                    console.error(error);
                    setVolumeError(true);
                });
        }

        const interval = setInterval(() => {
            queryRenVmTracker(renVmTracker, type, volumePeriod, true)
                .then((response) => {
                    setVolumeDataMap((map) =>
                        // If there's no existing entry, then don't update it
                        // since it would be an incomplete entry.
                        map.get(volumePeriod)
                            ? map.set(
                                  volumePeriod,
                                  updateVolumeData(
                                      map.get(volumePeriod),
                                      response.data,
                                  ),
                              )
                            : map,
                    );
                })
                .catch(console.error);
        }, VOLUME_REFRESH_PERIOD);

        return () => clearInterval(interval);
    }, [renVmTracker, type, volumePeriod, volumeData]);

    return {
        allVolumeData: volumeDataMap.get(PeriodOption.ALL),
        volumeData,
        volumeLoading: !volumeData,
        volumeError: volumeError && !volumeData,
        volumePeriod,
        setVolumePeriod,
    };
};

export const VolumeDataContainer = createContainer(useVolumeData);
