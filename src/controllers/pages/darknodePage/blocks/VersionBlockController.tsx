import React from "react";

import { RegistrationStatus } from "../../../../lib/ethereum/contractReads";
import { GithubAPIContainer } from "../../../../store/githubApiContainer";
import { GraphContainer } from "../../../../store/graphContainer";
import { DarknodesState } from "../../../../store/networkContainer";
import {
    DarknodeConnectionStatus,
    VersionBlock,
} from "../../../../views/darknodeBlocks/VersionBlock";

interface Props {
    darknodeDetails: DarknodesState | null;
}

export const VersionBlockController: React.FC<Props> = ({
    darknodeDetails,
}) => {
    const { latestDarknodeVersionFull, latestDarknodeVersionDaysAgo } =
        GithubAPIContainer.useContainer();

    const { renVM } = GraphContainer.useContainer();
    const epochStart = renVM
        ? Date.now() / 1000 - renVM.currentEpoch.timestamp.toNumber()
        : undefined;
    const bootstrapping = epochStart !== undefined && epochStart < 24 * 60 * 60;

    let status: DarknodeConnectionStatus;
    if (!darknodeDetails) {
        status = DarknodeConnectionStatus.Connecting;
    } else if (
        darknodeDetails.registrationStatus !== RegistrationStatus.Registered
    ) {
        status = DarknodeConnectionStatus.NotRegistered;
    } else if (darknodeDetails.nodeStatistics) {
        status = DarknodeConnectionStatus.Connected;
    } else if (bootstrapping) {
        status = DarknodeConnectionStatus.Bootstrapping;
    } else {
        status = DarknodeConnectionStatus.NotConnected;
    }

    return (
        <VersionBlock
            status={status}
            darknodeVersion={
                darknodeDetails && darknodeDetails.nodeStatistics
                    ? darknodeDetails.nodeStatistics.version
                    : null
            }
            latestVersion={latestDarknodeVersionFull}
            latestVersionDaysAgo={latestDarknodeVersionDaysAgo}
        />
    );
};
