import { useMemo, useState } from "react";
import {
    allTrackedChains,
    snapshotDataToAllChainVolumeData,
    TrackerVolumeType,
} from "../../../lib/graphQL/queries/renVmTracker";

import { PeriodOption } from "../../../lib/graphQL/volumes";
import { NetworkContainer } from "../../../store/networkContainer";
import { Stats } from "../../../views/Stat";
import { getRenPriceIn } from "../../common/tokenBalanceUtils";
import { ChainLabel, ChainOption, ChainSelector } from "./ChainSelector";
import { Collateral } from "./Collateral";
import { NetworkStatsStyles } from "./NetworkStatsStyles";
import { PeriodSelector } from "./PeriodSelector";
import { VolumeStats } from "./VolumeData";
import { VolumeDataContainer } from "./VolumeDataContainer";

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
    return `The 1 ${period.toLowerCase()} change in RenVM's locked digital assets on ${chainLabel}. Reflects changes in asset prices, so may be greater than the change in volume.`;
};

export const NetworkStatsPage = () => {
    const { quoteCurrency, tokenPrices, numberOfDarknodes } =
        NetworkContainer.useContainer();
    const {
        allVolumeData,
        volumeData,
        volumeLoading,
        volumeError,
        volumePeriod,
        setVolumePeriod,
    } = VolumeDataContainer.useContainer();

    const [chainOption, setChainOption] = useState(ChainOption.All);

    const allChainTotal = useMemo(() => {
        return tokenPrices === null || !allVolumeData
            ? null
            : snapshotDataToAllChainVolumeData(
                  allVolumeData,
                  TrackerVolumeType.Locked,
                  quoteCurrency,
                  tokenPrices,
              ).difference;
    }, [allVolumeData, tokenPrices, quoteCurrency]);

    const bondedRenAmount = numberOfDarknodes
        ? numberOfDarknodes.times(100000)
        : null;
    const renPrice = tokenPrices
        ? getRenPriceIn(quoteCurrency, tokenPrices)
        : 0;
    const bondedRenValue = bondedRenAmount
        ? bondedRenAmount.times(renPrice)
        : null;

    const fees = allTrackedChains.map((chain) => {
        return {
            mint: 15,
            burn: 15,
            chain: chain,
        };
    });
    return (
        <NetworkStatsStyles className="network-stats container">
            {/* <div className="no-xl-or-larger col-lg-12 col-xl-4">
                <div className="collateral-padding" />
                {collateral}
            </div> */}
            <div className="col-lg-12 col-xl-8">
                <div className="selectors">
                    <div className="selectors--chain">
                        <ChainSelector
                            value={chainOption}
                            onChange={setChainOption}
                        />
                    </div>
                    <div className="selectors--period">
                        <PeriodSelector
                            value={volumePeriod}
                            onChange={setVolumePeriod}
                        />
                    </div>
                </div>
                <Stats>
                    <VolumeStats
                        volumeData={volumeData || {}}
                        volumeLoading={volumeLoading}
                        volumeError={volumeError}
                        volumePeriod={volumePeriod}
                        trackerType={TrackerVolumeType.Transacted}
                        title="Volume"
                        titleTooltip="Total amount of volume transacted via RenVM."
                        historyChartLabel="Accumulative Volume"
                        tooltipRenderer={volumeTooltipRenderer}
                        chainOption={chainOption}
                    />
                    <VolumeStats
                        volumeData={volumeData || {}}
                        volumeLoading={volumeLoading}
                        volumeError={volumeError}
                        volumePeriod={volumePeriod}
                        trackerType={TrackerVolumeType.Locked}
                        title="Value Locked"
                        titleTooltip="The total value (TVL) of all digital assets currently minted on Ethereum by RenVM."
                        historyChartLabel="Locked"
                        tooltipRenderer={lockedTooltipRenderer}
                        chainOption={chainOption}
                    />
                </Stats>
            </div>
            <div className="col-lg-12 col-xl-4">
                <Collateral
                    fees={fees}
                    total={allChainTotal}
                    bondedRenValue={bondedRenValue}
                    bondedRen={bondedRenAmount}
                    quoteCurrency={quoteCurrency}
                />
            </div>
        </NetworkStatsStyles>
    );
};
