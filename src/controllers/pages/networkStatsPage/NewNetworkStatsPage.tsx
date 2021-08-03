import BigNumber from "bignumber.js";
import React, { useEffect, useMemo, useState } from "react";
import { isEmptyObject } from "../../../lib/general/isDefined";
import {
    snapshotDataToAllChainVolumeData,
    SnapshotRecords,
    TrackerVolumeType,
} from "../../../lib/graphQL/queries/renVmTracker";

import { PeriodOption } from "../../../lib/graphQL/volumes";
import { GraphContainer } from "../../../store/graphContainer";
import { NetworkContainer } from "../../../store/networkContainer";
import { Stats } from "../../../views/Stat";
import { getRenPriceIn } from "../../common/tokenBalanceUtils";
import { ChainLabel, ChainOption, ChainSelector } from "./ChainSelector";
import { Collateral } from "./Collateral";
import { NetworkStatsStyles } from "./NetworkStatsStyles";
import { PeriodSelector } from "./PeriodSelector";
import { useVolumeData, VolumeStats } from "./VolumeStats";

const volumeTooltipRenderer = (period: PeriodOption, chain: ChainOption) => {
    const chainLabel =
        chain === ChainOption.All ? "all chains" : ChainLabel[chain];
    return `Total amount of volume transacted via RenVM on ${chainLabel}.`;
};

const lockedTooltipRenderer = (period: PeriodOption, chain: ChainOption) => {
    const chainLabel =
        chain === ChainOption.All ? "all chains" : ChainLabel[chain];
    if (period === PeriodOption.ALL) {
        return `The total value (TVL) of all digital assets currently minted on ${chainLabel} by RenVM.`;
    }
    return `The 1 ${period.toLowerCase()} change in RenVM's locked digital assets on ${chainLabel}.`;
};

export const NewNetworkStatsPage = () => {
    const { renVM } = GraphContainer.useContainer();
    const { btcMintFee, btcBurnFee } = renVM || {};
    const {
        quoteCurrency,
        tokenPrices,
        numberOfDarknodes,
    } = NetworkContainer.useContainer();
    const [totalVolumeData, setTotalVolumeData] = useState<SnapshotRecords>({});
    const {
        volumeData,
        volumeLoading,
        volumePeriod,
        setVolumePeriod,
    } = useVolumeData(PeriodOption.ALL);

    useEffect(() => {
        if (!isEmptyObject(volumeData)) {
            setTotalVolumeData(volumeData);
        }
    }, [volumeData]);

    const [chainOption, setChainOption] = useState(ChainOption.All);

    const allChainTotal = useMemo(() => {
        return tokenPrices === null || isEmptyObject(totalVolumeData)
            ? new BigNumber(0)
            : snapshotDataToAllChainVolumeData(
                  totalVolumeData,
                  TrackerVolumeType.Locked,
                  quoteCurrency,
                  tokenPrices,
              ).difference;
    }, [totalVolumeData, tokenPrices, quoteCurrency]);

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
                <div className="selectors">
                    <ChainSelector
                        value={chainOption}
                        onChange={setChainOption}
                    />
                    <PeriodSelector
                        value={volumePeriod}
                        onChange={setVolumePeriod}
                    />
                </div>
                <Stats>
                    <VolumeStats
                        volumeData={volumeData}
                        volumeLoading={volumeLoading}
                        volumePeriod={volumePeriod}
                        trackerType={TrackerVolumeType.Transacted}
                        title="Volume"
                        titleTooltip="Total amount of volume transacted via RenVM."
                        historyChartLabel="Accumulative Volume"
                        tooltipRenderer={volumeTooltipRenderer}
                        chainOption={chainOption}
                    />
                    <VolumeStats
                        volumeData={volumeData}
                        volumeLoading={volumeLoading}
                        volumePeriod={volumePeriod}
                        trackerType={TrackerVolumeType.Locked}
                        title="Value Minted"
                        titleTooltip="The total value (TVL) of all digital assets currently minted on Ethereum by RenVM."
                        historyChartLabel="Locked"
                        tooltipRenderer={lockedTooltipRenderer}
                        chainOption={chainOption}
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
