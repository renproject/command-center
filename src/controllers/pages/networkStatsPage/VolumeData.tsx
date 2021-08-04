import BigNumber from "bignumber.js";
import React, { useMemo, useState } from "react";

import { CurrencyIcon, Loading } from "@renproject/react-components";

import {
    chainOptionToTrackerChain,
    getFirstAndLastSnapshot,
    getSnapshots,
    snaphostDataToAllChainTimeSeries,
    snapshotDataToAllChainVolumeData,
    snapshotDataToTimeSeries,
    snapshotDataToVolumeData,
    SnapshotRecords,
    TrackerVolumeType,
} from "../../../lib/graphQL/queries/renVmTracker";
import { PeriodOption } from "../../../lib/graphQL/volumes";
import { NetworkContainer } from "../../../store/networkContainer";
import { ReactComponent as IconValueLocked } from "../../../styles/images/icon-value-locked.svg";
import { ReactComponent as IconVolume } from "../../../styles/images/icon-volume.svg";
import { Stat } from "../../../views/Stat";
import {
    ChainLabel,
    ChainLineColors,
    ChainLineColorsTransparent,
    ChainOption,
} from "./ChainSelector";
import { DoughnutChart } from "./DoughnutChart";
import { Graph, Line } from "./Graph";
import { StatTab, StatTabs } from "./StatTabs";

export const getPeriodPercentChange = <K extends string>(
    periodType: PeriodOption,
    property: K,
    seriesData?: Array<{ [key in K]?: string }> | undefined,
) => {
    if (
        periodType !== PeriodOption.ALL &&
        seriesData &&
        seriesData.length > 1
    ) {
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

export const updateVolumeData = (
    oldData: SnapshotRecords | undefined,
    updateData: SnapshotRecords,
) => {
    if (!oldData) {
        return updateData;
    }
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

type VolumeStatsProps = {
    trackerType: TrackerVolumeType;
    title: string;
    historyChartLabel: string;
    titleTooltip: string;
    tooltipRenderer: (period: PeriodOption, chain: ChainOption) => string;
    initialVolume?: SnapshotRecords;
    volumeData: SnapshotRecords;
    volumePeriod: PeriodOption;
    volumeLoading: boolean;
    volumeError: boolean;
    chainOption: ChainOption;
};

export const VolumeStats: React.FC<VolumeStatsProps> = ({
    trackerType,
    title,
    historyChartLabel,
    tooltipRenderer,
    volumeData,
    volumePeriod,
    volumeLoading,
    volumeError,
    chainOption,
}) => {
    const [volumeTab, setVolumeTab] = useState<StatTab>(StatTab.History);

    const { quoteCurrency, tokenPrices } = NetworkContainer.useContainer();

    const calculatedVolumeData = useMemo(() => {
        const fallback = {
            amountRecords: {},
            difference: 0,
        };
        if (!volumeLoading && tokenPrices) {
            if (chainOption !== ChainOption.All) {
                const trackerChain = chainOptionToTrackerChain(chainOption);
                return snapshotDataToVolumeData(
                    volumeData,
                    trackerType,
                    trackerChain,
                    quoteCurrency,
                    tokenPrices,
                );
            }
            return snapshotDataToAllChainVolumeData(
                volumeData,
                trackerType,
                quoteCurrency,
                tokenPrices,
            );
        }
        return fallback;
    }, [
        volumeLoading,
        trackerType,
        volumeData,
        chainOption,
        quoteCurrency,
        tokenPrices,
    ]);

    const linesData: Line[] = useMemo(() => {
        return [
            ChainOption.All,
            ChainOption.Ethereum,
            ChainOption.BinanceSmartChain,
            ChainOption.Fantom,
            ChainOption.Polygon,
            ChainOption.Avalanche,
            ChainOption.Solana,
        ].map((chainOptionInner) => {
            let series: Array<[number, number]> = [];
            if (!volumeLoading && tokenPrices) {
                if (chainOptionInner !== ChainOption.All) {
                    const trackerChain = chainOptionToTrackerChain(
                        chainOptionInner,
                    );
                    series = snapshotDataToTimeSeries(
                        volumeData,
                        trackerType,
                        trackerChain,
                        quoteCurrency,
                        tokenPrices,
                    );
                    const first = series[0];
                    series = series.map(([x, y]) => [x, y - first[1]]);
                } else {
                    series = snaphostDataToAllChainTimeSeries(
                        volumeData,
                        trackerType,
                        quoteCurrency,
                        tokenPrices,
                    );
                    const first = series[0];
                    series = series.map(([x, y]) => [x, y - first[1]]);
                }
            }

            const line: Line = {
                name: `${
                    ChainLabel[chainOptionInner] || chainOptionInner
                } (${quoteCurrency.toUpperCase()})`,
                axis: 0,
                data: series,
                color:
                    chainOption === chainOptionInner
                        ? ChainLineColors[chainOptionInner]
                        : ChainLineColorsTransparent[chainOptionInner],
                hidden:
                    chainOption !== ChainOption.All &&
                    chainOptionInner !== chainOption,
            };
            return line;
        });
    }, [
        quoteCurrency,
        tokenPrices,
        volumeLoading,
        volumeData,
        trackerType,
        chainOption,
    ]);

    const volumePeriodTotal = calculatedVolumeData.difference;
    return (
        <div className="stat-with-period">
            <Stat
                message={
                    <>
                        {title}{" "}
                        <span className="stat--subtitle">
                            (
                            {volumePeriod === PeriodOption.ALL
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
                infoLabel={<>{tooltipRenderer(volumePeriod, chainOption)}</>}
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
                ) : !volumeError ? (
                    <Loading alt />
                ) : null}
                <div className="overview--bottom">
                    <StatTabs
                        selected={volumeTab}
                        onChange={setVolumeTab}
                        volumePeriod={volumePeriod}
                        assetsPeriod={volumePeriod}
                    />
                    <>
                        {volumeError ? (
                            <div className="volume--error">
                                Unable to fetch data
                            </div>
                        ) : volumeLoading ? (
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
