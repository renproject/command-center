import { CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useEffect, useMemo, useState } from "react";
import { GraphClientContainer } from "../../../lib/graphQL/ApolloWithNetwork";
import {
    getFirstAndLastSnapshot,
    getResolutionInterval,
    getSnapshots,
    networkStatsChainToTrackerChain,
    queryRenVmTracker,
    snapshotDataToTimeSeries,
    snapshotDataToVolumeData,
    SnapshotRecords,
    TrackerVolumeType,
} from "../../../lib/graphQL/queries/renVmTracker";

import { PeriodType } from "../../../lib/graphQL/volumes";
import { NetworkContainer } from "../../../store/networkContainer";
import { ReactComponent as IconValueLocked } from "../../../styles/images/icon-value-locked.svg";
import { ReactComponent as IconVolume } from "../../../styles/images/icon-volume.svg";
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

const updateVolumeData = (
    oldData: SnapshotRecords,
    updateData: SnapshotRecords,
) => {
    const newSnapshot = Object.values(updateData)[0];
    const oldCount = Object.keys(oldData).length;
    const newData = {
        ...oldData,
        [`s${newSnapshot.timestamp}`]: newSnapshot,
    };
    const newCount = Object.keys(newData).length;
    //preserve data size
    if (newCount > oldCount) {
        const snapshots = getSnapshots(oldData);
        const { first } = getFirstAndLastSnapshot(snapshots);
        delete newData[`s${first.timestamp}`];
    }
    return newData;
};

export const useVolumeData = (
    type: TrackerVolumeType,
    initialPeriod = PeriodType.ALL,
    initialVolume: SnapshotRecords = {},
) => {
    const { renVmTracker } = GraphClientContainer.useContainer();

    const [volumeData, setVolumeData] = useState<SnapshotRecords>(
        initialVolume,
    );
    const [volumeLoading, setVolumeLoading] = useState(true);
    const [volumePeriod, setVolumePeriod] = useState<PeriodType>(initialPeriod);

    useEffect(() => {
        setVolumeLoading(true);
        queryRenVmTracker(renVmTracker, type, volumePeriod)
            .then((response) => {
                console.log(response);
                setVolumeData(response.data);
                setVolumeLoading(false);
            })
            .catch(console.error);

        const resolution = getResolutionInterval(volumePeriod); // TBD: this can be quicker, like every 2 minutes
        const interval = setInterval(() => {
            console.log("updating");
            queryRenVmTracker(renVmTracker, type, volumePeriod, true)
                .then((response) => {
                    console.log(response);
                    setVolumeData((data) =>
                        updateVolumeData(data, response.data),
                    );
                })
                .catch(console.error);
        }, resolution * 1000);

        return () => clearInterval(interval);
    }, [renVmTracker, type, volumePeriod]);

    return {
        volumeData,
        volumeLoading: volumeLoading || !volumeData,
        volumePeriod,
        setVolumePeriod,
    };
};

type VolumeStatsProps = {
    trackerType: TrackerVolumeType;
    title: string;
    historyChartLabel: string;
    titleTooltip: string;
    tooltipRenderer: (period: PeriodType, chain: NetworkStatsChain) => string;
    initialVolume?: SnapshotRecords;
};

export const VolumeStats: React.FC<VolumeStatsProps> = ({
    trackerType,
    title,
    historyChartLabel,
    tooltipRenderer,
    initialVolume = {},
}) => {
    const { quoteCurrency, tokenPrices } = NetworkContainer.useContainer();
    const {
        volumeData,
        volumeLoading,
        volumePeriod,
        setVolumePeriod,
    } = useVolumeData(trackerType, PeriodType.ALL, initialVolume);

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
        if (!volumeLoading && tokenPrices) {
            return snapshotDataToVolumeData(
                volumeData,
                trackerType,
                volumeChain,
                quoteCurrency,
                tokenPrices,
            );
        }
        return fallback;
    }, [
        volumeLoading,
        trackerType,
        volumeData,
        volumeChain,
        quoteCurrency,
        tokenPrices,
    ]);

    const linesData = useMemo(() => {
        let series: Array<[number, number]> = [];
        if (!volumeLoading && tokenPrices) {
            series = snapshotDataToTimeSeries(
                volumeData,
                trackerType,
                volumeChain,
                quoteCurrency,
                tokenPrices,
            );
        }
        // console.log("series", series);

        const line: Line = {
            name: `${historyChartLabel} (${quoteCurrency.toUpperCase()})`,
            axis: 0,
            data: series,
        };
        return [line];
    }, [
        quoteCurrency,
        historyChartLabel,
        tokenPrices,
        volumeLoading,
        volumeData,
        trackerType,
        volumeChain,
    ]);

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
                    trackerType === TrackerVolumeType.Transacted ? (
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
                        {volumeLoading ? (
                            <Loading alt={true} />
                        ) : volumeTab === StatTab.History ? (
                            <Graph lines={linesData} />
                        ) : (
                            <DoughnutChart
                                title={title}
                                quoteCurrency={quoteCurrency}
                                data={calculatedVolumeData.amountRecords}
                            />
                        )}
                    </>
                </div>
            </Stat>
        </div>
    );
};
