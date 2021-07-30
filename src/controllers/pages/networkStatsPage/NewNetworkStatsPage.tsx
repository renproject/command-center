import BigNumber from "bignumber.js";
import React from "react";
import {
    snapshotDataToAllChainVolumeData,
    TrackerType,
} from "../../../lib/graphQL/queries/renVmTracker";

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
import { useVolumeData, VolumeStats } from "./VolumeStats";

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
    const { numberOfDarknodes } = NetworkStatsContainer.useContainer();

    const { volumeData, volumeLoading } = useVolumeData(
        TrackerType.Locked,
        PeriodType.ALL,
    );
    const allChainTotal =
        tokenPrices === null || volumeLoading
            ? new BigNumber(0)
            : snapshotDataToAllChainVolumeData(
                  volumeData,
                  TrackerType.Locked,
                  quoteCurrency,
                  tokenPrices,
              );

    const bondedRenAmount = (numberOfDarknodes || new BigNumber(0)).times(
        100000,
    );
    const renPrice = tokenPrices
        ? getRenPriceIn(quoteCurrency, tokenPrices)
        : 0;
    const bondedRenValue = bondedRenAmount.times(renPrice);
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
                    total={allChainTotal}
                    bondedRenValue={bondedRenValue}
                    bondedRen={bondedRenAmount}
                    quoteCurrency={quoteCurrency}
                    mintFee={btcMintFee}
                    burnFee={btcBurnFee}
                />
            </div>
        </NetworkStatsStyles>
    );
};
