import { Currency, CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useEffect, useMemo, useState } from "react";
import { GraphClientContainer } from "../../../lib/graphQL/ApolloWithNetwork";
import {
    TokenCurrency,
    networkStatsChainToTrackerChain,
    queryRenVmTracker,
    snapshotDataToTimeSeries,
    snapshotDataToVolumeData,
    SnapshotRecords,
    TrackerType,
} from "../../../lib/graphQL/queries/renVmTracker";

import { PeriodType } from "../../../lib/graphQL/volumes";
import { NetworkContainer } from "../../../store/networkContainer";
import { ReactComponent as IconVolume } from "../../../styles/images/icon-volume.svg";
import { ReactComponent as IconValueLocked } from "../../../styles/images/icon-value-locked.svg";
import { Stat } from "../../../views/Stat";
import { ChainSelector } from "./ChainSelector";
import { DoughnutChart } from "./DoughnutChart";
import { Graph, Line } from "./Graph";
import { NetworkStatsChain } from "./networkStatsContainer";
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

export const useVolumeData = (type: TrackerType) => {
    const { renVmTracker } = GraphClientContainer.useContainer();

    const [volumeData, setVolumeData] = useState<SnapshotRecords>({});
    const [volumeLoading, setVolumeLoading] = useState(true);
    const [volumePeriod, setVolumePeriod] = useState<PeriodType>(
        PeriodType.ALL,
    );

    useEffect(() => {
        setVolumeLoading(true);
        queryRenVmTracker(renVmTracker, type, volumePeriod)
            .then((response) => {
                setVolumeData(response.data);
                setVolumeLoading(false);
            })
            .catch(console.error);
    }, [volumePeriod, type]);

    return {
        volumeData,
        volumeLoading,
        volumePeriod,
        setVolumePeriod,
    };
};

type VolumeStatsProps = {
    trackerType: TrackerType;
    title: string;
    historyChartLabel: string;
    titleTooltip: string;
    tooltipRenderer: (
        volumePeriod: PeriodType,
        chain: NetworkStatsChain,
    ) => string;
};

export const VolumeStats: React.FC<VolumeStatsProps> = ({
    trackerType,
    title,
    historyChartLabel,
    tooltipRenderer,
}) => {
    const { quoteCurrency, tokenPrices } = NetworkContainer.useContainer();
    console.log("tp", tokenPrices?.toJS());
    const {
        volumeData,
        volumeLoading,
        volumePeriod,
        setVolumePeriod,
    } = useVolumeData(trackerType);

    const [volumeSelectedChain, setVolumeSelectedChain] = useState(
        NetworkStatsChain.Ethereum,
    );
    const [volumeTab, setVolumeTab] = useState<StatTab>(StatTab.History);
    const volumeChain = networkStatsChainToTrackerChain(volumeSelectedChain);

    const calculatedVolumeData = useMemo(() => {
        const fallback = {
            amountRecords: {},
            difference: 0,
        };
        if (volumeLoading || !volumeData) {
            return fallback;
        }
        console.log("tokenPrices", tokenPrices?.toJS());
        if (tokenPrices !== null) {
            return snapshotDataToVolumeData(
                volumeData,
                trackerType,
                volumeChain,
                quoteCurrency,
                tokenPrices,
            );
        }
        return fallback;
    }, [volumeLoading, volumeData, volumeChain, quoteCurrency, tokenPrices]);
    console.log("dh", calculatedVolumeData);

    const linesData = useMemo(() => {
        let series: Array<[number, number]> = [];
        if (tokenPrices) {
            series = snapshotDataToTimeSeries(
                volumeData,
                trackerType,
                volumeChain,
                quoteCurrency,
                tokenPrices,
            );
        }

        console.log("series", series);

        const line: Line = {
            name: `${historyChartLabel} (${quoteCurrency.toUpperCase()})`,
            axis: 0,
            data: series,
        };
        return [line];
    }, [quoteCurrency, volumeData, trackerType, volumeChain]);

    console.log("ld", linesData[0].data[0]);
    const volumePeriodTotal = calculatedVolumeData.difference;
    return (
        <div className="stat-with-period">
            <PeriodSelector
                selected={volumePeriod}
                onChange={setVolumePeriod}
            />
            <Stat
                message={
                    <>
                        {title}{" "}
                        <span className="stat--subtitle">
                            (
                            {volumePeriod === PeriodType.ALL
                                ? volumePeriod
                                : `1${volumePeriod.slice(0, 1).toUpperCase()}`}
                            )
                        </span>
                    </>
                }
                icon={
                    trackerType === TrackerType.Volume ? (
                        <IconVolume />
                    ) : (
                        <IconValueLocked />
                    )
                }
                big={true}
                infoLabel={
                    <>{tooltipRenderer(volumePeriod, volumeSelectedChain)}</>
                }
                className="stat--extra-big"
            >
                {!volumeLoading ? (
                    <div>
                        <span className="stat-amount">
                            <CurrencyIcon currency={quoteCurrency} />
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
                                <Graph lines={linesData} />
                            ) : (
                                <DoughnutChart
                                    title={title}
                                    quoteCurrency={quoteCurrency}
                                    data={calculatedVolumeData.amountRecords}
                                />
                            )
                        ) : (
                            <Loading alt={true} />
                        )}
                    </>
                </div>
            </Stat>
        </div>
    );
};
