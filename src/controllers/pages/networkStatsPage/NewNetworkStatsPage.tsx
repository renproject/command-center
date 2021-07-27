import { Currency, CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useMemo, useState } from "react";
import { GraphClientContainer } from "../../../lib/graphQL/ApolloWithNetwork";

import {
    PeriodType,
    QuotePeriodData,
    QuoteSeriesData,
    SeriesData,
} from "../../../lib/graphQL/volumes";
import { GraphContainer } from "../../../store/graphContainer";
import { NetworkContainer } from "../../../store/networkContainer";
import { TrackerContainer } from "../../../store/trackerContainer";
import { ReactComponent as IconValueLocked } from "../../../styles/images/icon-value-locked.svg";
import { ReactComponent as IconVolume } from "../../../styles/images/icon-volume.svg";
import { Change } from "../../../views/Change";
import { Stat, Stats } from "../../../views/Stat";
import { ChainSelector } from "./ChainSelector";
import { Collateral } from "./Collateral";
import { DoughnutChart } from "./DoughnutChart";
import { Graph } from "./Graph";
import { Map } from "immutable";
import {
    NetworkStatsChain,
    NetworkStatsContainer,
} from "./networkStatsContainer";
import { NetworkStatsStyles } from "./NetworkStatsStyles";
import { PeriodSelector } from "./PeriodSelector";
import { StatTab, StatTabs } from "./StatTabs";

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

const timeSeries = (
    quoteLockedPeriod: SeriesData,
    field: keyof QuotePeriodData,
): Array<[number, number]> =>
    quoteLockedPeriod.series.map((item) => [
        item.date || 0,
        BigNumber.isBigNumber(item[field])
            ? item[field].toNumber()
            : typeof item[field] === "number"
            ? (item[field] as number)
            : parseInt(String(item[field]), 10),
    ]);

const VOLUME_AXIS = 0;

export const NewNetworkStatsPage = () => {
    const { quoteCurrency } = NetworkContainer.useContainer();
    const {
        volumePeriod,
        volumeLoading,
        setVolumePeriod,
    } = TrackerContainer.useContainer();

    const [volumeSelectedChain, setVolumeSelectedChain] = useState(
        NetworkStatsChain.Ethereum,
    );
    const [volumeTab, setVolumeTab] = useState<StatTab>(StatTab.History);

    const [lockedSelectedChain, setLockedSelectedChain] = useState(
        NetworkStatsChain.Ethereum,
    );
    const [lockedTab, setLockedTab] = useState<StatTab>(StatTab.History);

    const volumePeriodTotal = new BigNumber(42);
    const total = 500;
    const mintedTotal = 400;
    return (
        <NetworkStatsStyles className="network-stats container">
            {/* <div className="no-xl-or-larger col-lg-12 col-xl-4">
                <div className="collateral-padding" />
                {collateral}
            </div> */}

            <div className="col-lg-12 col-xl-8">
                <Stats>
                    <div className="stat-with-period">
                        <PeriodSelector
                            selected={volumePeriod}
                            onChange={setVolumePeriod}
                        />
                        <Stat
                            message={
                                <>
                                    Volume{" "}
                                    <span className="stat--subtitle">
                                        (
                                        {volumePeriod === PeriodType.ALL
                                            ? volumePeriod
                                            : `1${volumePeriod
                                                  .slice(0, 1)
                                                  .toUpperCase()}`}
                                        )
                                    </span>
                                </>
                            }
                            icon={<IconVolume />}
                            big={true}
                            infoLabel={
                                <>
                                    Total amount of volume transacted via RenVM.
                                </>
                            }
                            className="stat--extra-big"
                        >
                            {!volumeLoading ? (
                                <div>
                                    <span className="stat-amount">
                                        <CurrencyIcon
                                            currency={quoteCurrency}
                                        />
                                        <span className="stat-amount--value">
                                            {volumePeriodTotal ? (
                                                <>
                                                    {new BigNumber(
                                                        volumePeriodTotal,
                                                    ).toFormat(2)}
                                                </>
                                            ) : (
                                                "..."
                                            )}
                                        </span>
                                    </span>
                                </div>
                            ) : (
                                <Loading alt />
                            )}
                            <div className="overview--bottom">
                                <div className="overview--select-chain">
                                    <ChainSelector
                                        selected={volumeSelectedChain}
                                        onChange={setVolumeSelectedChain}
                                    />
                                </div>
                                <StatTabs
                                    selected={volumeTab}
                                    onChange={setVolumeTab}
                                    volumePeriod={volumePeriod}
                                    assetsPeriod={volumePeriod}
                                />
                                <>
                                    {!volumeLoading ? (
                                        volumeTab === StatTab.History ? (
                                            <span>Graph</span>
                                        ) : (
                                            <DoughnutChart
                                                title="Volume"
                                                quoteCurrency={quoteCurrency}
                                                data={undefined}
                                                altData={undefined}
                                            />
                                        )
                                    ) : (
                                        <Loading alt={true} />
                                    )}
                                </>
                            </div>
                        </Stat>
                    </div>
                </Stats>
            </div>
            <div className="col-lg-12 col-xl-4">
                <div className="collateral-padding" />
            </div>
        </NetworkStatsStyles>
    );
};
