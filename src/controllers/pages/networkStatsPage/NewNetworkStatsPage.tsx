import { Currency, CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useMemo, useState } from "react";
import { Token } from "../../../lib/ethereum/tokens";
import {
    AmountKind,
    networkStatsChainToTrackerChain,
    snapshotDataToVolumeData,
    TrackerChain,
    TrackerType,
} from "../../../lib/graphQL/queries/renVmTracker";

import {
    PeriodType,
    QuotePeriodData,
    SeriesData,
} from "../../../lib/graphQL/volumes";
import { NetworkContainer } from "../../../store/networkContainer";
import { TrackerContainer } from "../../../store/trackerContainer";
import { ReactComponent as IconVolume } from "../../../styles/images/icon-volume.svg";
import { Stat, Stats } from "../../../views/Stat";
import { convertTokenAmount } from "../../common/tokenBalanceUtils";
import { ChainSelector } from "./ChainSelector";
import { DoughnutChart } from "./DoughnutChart";
import { NetworkStatsChain } from "./networkStatsContainer";
import { NetworkStatsStyles } from "./NetworkStatsStyles";
import { PeriodSelector } from "./PeriodSelector";
import { StatTab, StatTabs } from "./StatTabs";
import { VolumeStats } from "./VolumeStats";

export const getPeriodPercentChange = <K extends string>(
    periodType: PeriodType,
    property: K,
    seriesData?: Array<{ [key in K]?: string }> | undefined,
) => {
    if (periodType !== PeriodType.ALL && seriesData && seriesData.length > 1) {
        const historic = seriesData;
        const prev = historic[0];
        const curr = historic[historic.length - 1];
        return new BigNumber((curr[property] || "0") as string)
            .minus((prev[property] || "0") as string)
            .dividedBy((curr[property] || "0") as string)
            .multipliedBy(100);
    }
    return null;
};

const VOLUME_AXIS = 0;

export const NewNetworkStatsPage = () => {
    const volumePeriodTotal = new BigNumber(42);
    return (
        <NetworkStatsStyles className="network-stats container">
            {/* <div className="no-xl-or-larger col-lg-12 col-xl-4">
                <div className="collateral-padding" />
                {collateral}
            </div> */}
            <div className="col-lg-12 col-xl-8">
                <Stats>
                    <VolumeStats />
                </Stats>
            </div>
            <div className="col-lg-12 col-xl-4">
                <div className="collateral-padding" />
            </div>
        </NetworkStatsStyles>
    );
};
