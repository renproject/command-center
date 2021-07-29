import BigNumber from "bignumber.js";
import React from "react";
import { TrackerType } from "../../../lib/graphQL/queries/renVmTracker";

import { PeriodType } from "../../../lib/graphQL/volumes";
import { GraphContainer } from "../../../store/graphContainer";
import { NetworkContainer } from "../../../store/networkContainer";
import { Stats } from "../../../views/Stat";
import { getRenPriceIn } from "../../common/tokenBalanceUtils";
import { Collateral } from "./Collateral";
import {
    NetworkStatsChain,
    NetworkStatsContainer,
} from "./networkStatsContainer";
import { NetworkStatsStyles } from "./NetworkStatsStyles";
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

const volumeTooltipRenderer = (
    period: PeriodType,
    chain: NetworkStatsChain,
) => {
    return `Total amount of volume transacted via RenVM on ${chain.toString()}`;
};

const lockedTooltipRenderer = (
    period: PeriodType,
    chain: NetworkStatsChain,
) => {
    if (period === PeriodType.ALL) {
        return `The total value (TVL) of all digital assets currently minted on ${chain.toString()} by RenVM.`;
    }
    return `The 1 ${period.toLowerCase()} change in RenVM's locked digital assets.`;
};

export const NewNetworkStatsPage = () => {
    const { renVM } = GraphContainer.useContainer();
    const { btcMintFee, btcBurnFee } = renVM || {};
    const { quoteCurrency, tokenPrices } = NetworkContainer.useContainer();
    const {
        total,
        mintedTotal,
        b,
        numberOfDarknodes,
    } = NetworkStatsContainer.useContainer();

    const renPrice = tokenPrices
        ? getRenPriceIn(quoteCurrency, tokenPrices)
        : 0;
    return (
        <NetworkStatsStyles className="network-stats container">
            {/* <div className="no-xl-or-larger col-lg-12 col-xl-4">
                <div className="collateral-padding" />
                {collateral}
            </div> */}
            <div className="col-lg-12 col-xl-8">
                <Stats>
                    <VolumeStats
                        trackerType={TrackerType.Volume}
                        title="Volume"
                        titleTooltip="Total amount of volume transacted via RenVM."
                        historyChartLabel="Accumulative Volume"
                        tooltipRenderer={volumeTooltipRenderer}
                    />
                    <VolumeStats
                        trackerType={TrackerType.Locked}
                        title="Value Minted"
                        titleTooltip="The total value (TVL) of all digital assets currently minted on Ethereum by RenVM."
                        historyChartLabel="Locked"
                        tooltipRenderer={lockedTooltipRenderer}
                    />
                </Stats>
            </div>
            <div className="col-lg-12 col-xl-4">
                <div className="collateral-padding" />
                <Collateral
                    l={total}
                    minted={mintedTotal}
                    b={b}
                    bRen={(numberOfDarknodes || new BigNumber(0)).times(100000)}
                    quoteCurrency={quoteCurrency}
                    mintFee={btcMintFee}
                    burnFee={btcBurnFee}
                />
            </div>
        </NetworkStatsStyles>
    );
};
