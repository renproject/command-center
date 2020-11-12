import { CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useMemo } from "react";

import {
    PeriodType,
    QuotePeriodData,
    SeriesData,
} from "../../../lib/graphQL/volumes";
import { ReactComponent as IconValueLocked } from "../../../styles/images/icon-value-locked.svg";
import { ReactComponent as IconVolume } from "../../../styles/images/icon-volume.svg";
import { Change } from "../../../views/Change";
import { InfoLabel } from "../../../views/infoLabel/InfoLabel";
import { Stat, Stats } from "../../../views/Stat";
import { Collateral } from "./Collateral";
import { DoughnutChart } from "./DoughnutChart";
import { Graph } from "./Graph";
import { NetworkStatsContainer } from "./networkStatsContainer";
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

export const NetworkStats = () => {
    const {
        volumePeriod,
        setVolumePeriod,
        quoteCurrency,
        volumeTab,
        lockedPeriod,
        setLockedPeriod,
        setVolumeTab,
        quotePeriodSeries,
        lockedTab,
        setLockedTab,
        total,
        mintedTotal,
        b,
        numberOfDarknodes,
    } = NetworkStatsContainer.useContainer();
    const quoteVolumeSeries = quotePeriodSeries.get(volumePeriod);
    const quoteLockedSeries = quotePeriodSeries.get(lockedPeriod);
    const [, totalLockedPercentChange]: [
        BigNumber | null,
        BigNumber | null,
    ] = useMemo(() => {
        const volumeChange = getPeriodPercentChange(
            volumePeriod,
            "quoteVolumeTotal",
            quoteVolumeSeries && quoteVolumeSeries.series,
        );
        const lockedChange = getPeriodPercentChange(
            lockedPeriod,
            "quoteLockedTotal",
            quoteLockedSeries && quoteLockedSeries.series,
        );
        return [volumeChange, lockedChange];
    }, [volumePeriod, quoteVolumeSeries, lockedPeriod, quoteLockedSeries]);

    return (
        <div className="network-stats container">
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
                            {quoteVolumeSeries ? (
                                <div>
                                    <span className="stat-amount">
                                        <CurrencyIcon
                                            currency={quoteCurrency}
                                        />
                                        <span className="stat-amount--value">
                                            {quoteVolumeSeries.difference
                                                .quoteVolumeTotal ? (
                                                <>
                                                    {new BigNumber(
                                                        quoteVolumeSeries.difference.quoteVolumeTotal,
                                                    ).toFormat(2)}
                                                    <InfoLabel
                                                        direction={"bottom"}
                                                        style={{
                                                            display:
                                                                "inline-block",
                                                        }}
                                                    >
                                                        From 11/11/2020 the
                                                        volume statistic has
                                                        been updated to use
                                                        historical asset prices
                                                        (the price of the asset
                                                        when it moved through
                                                        RenVM).
                                                    </InfoLabel>
                                                </>
                                            ) : (
                                                "..."
                                            )}
                                        </span>
                                    </span>
                                    {/*{totalVolumePercentChange !== null && (*/}
                                    {/*  <Change*/}
                                    {/*    className="stat--children--diff hidden"*/}
                                    {/*    change={totalVolumePercentChange.toFormat(2)}*/}
                                    {/*  >*/}
                                    {/*    %*/}
                                    {/*  </Change>*/}
                                    {/*)}*/}
                                </div>
                            ) : (
                                <Loading alt />
                            )}
                            <div className="overview--bottom">
                                <StatTabs
                                    selected={volumeTab}
                                    onChange={setVolumeTab}
                                    volumePeriod={volumePeriod}
                                    assetsPeriod={volumePeriod}
                                />
                                <>
                                    {quoteVolumeSeries ? (
                                        volumeTab === StatTab.History ? (
                                            <Graph
                                                lines={[
                                                    {
                                                        name: `Accumulative Volume (${quoteCurrency.toUpperCase()})`,
                                                        data: timeSeries(
                                                            quoteVolumeSeries,
                                                            "quoteVolumeTotal",
                                                        ),
                                                        axis: VOLUME_AXIS,
                                                    },
                                                ]}
                                            />
                                        ) : (
                                            <DoughnutChart
                                                title="Volume"
                                                quoteCurrency={quoteCurrency}
                                                data={
                                                    quoteVolumeSeries.difference
                                                        .quoteVolume
                                                }
                                            />
                                        )
                                    ) : (
                                        <Loading alt={true} />
                                    )}
                                </>
                            </div>
                        </Stat>
                    </div>
                    <div className="stat-with-period">
                        <PeriodSelector
                            selected={lockedPeriod}
                            onChange={setLockedPeriod}
                        />
                        <Stat
                            message="Value minted"
                            icon={<IconValueLocked />}
                            infoLabel={
                                lockedPeriod === PeriodType.ALL ? (
                                    <>
                                        The total value (TVL) of all digital
                                        assets currently minted on Ethereum by
                                        RenVM.
                                    </>
                                ) : (
                                    <>
                                        The 1 {lockedPeriod.toLowerCase()}{" "}
                                        change in RenVM's locked digital assets.
                                    </>
                                )
                            }
                            big={true}
                            className="stat--extra-big"
                        >
                            {quoteLockedSeries ? (
                                <div>
                                    <span className="stat-amount">
                                        <CurrencyIcon
                                            currency={quoteCurrency}
                                        />
                                        <span className="stat-amount--value">
                                            {quoteLockedSeries.difference
                                                .quoteLockedTotal
                                                ? new BigNumber(
                                                      quoteLockedSeries.difference.quoteLockedTotal,
                                                  ).toFormat(2)
                                                : "..."}
                                        </span>
                                    </span>
                                    {totalLockedPercentChange !== null &&
                                        !totalLockedPercentChange.isNaN && (
                                            <Change
                                                className="stat--children--diff"
                                                change={totalLockedPercentChange.toFormat(
                                                    2,
                                                )}
                                            >
                                                %
                                            </Change>
                                        )}
                                </div>
                            ) : (
                                <Loading alt={true} />
                            )}
                            <div className="overview--bottom">
                                <StatTabs
                                    selected={lockedTab}
                                    onChange={setLockedTab}
                                    volumePeriod={lockedPeriod}
                                    assetsPeriod={null}
                                />
                                {quoteLockedSeries ? (
                                    lockedTab === StatTab.History ? (
                                        <Graph
                                            lines={[
                                                {
                                                    name: `Locked (${quoteCurrency.toUpperCase()})`,
                                                    data: timeSeries(
                                                        quoteLockedSeries,
                                                        "quoteLockedTotalHistoric",
                                                    ),
                                                    axis: VOLUME_AXIS,
                                                },
                                            ]}
                                        />
                                    ) : (
                                        <DoughnutChart
                                            title="Locked"
                                            quoteCurrency={quoteCurrency}
                                            data={
                                                quoteLockedSeries.difference
                                                    .quoteLocked || {}
                                            }
                                        />
                                    )
                                ) : (
                                    <Loading alt={true} />
                                )}
                            </div>
                        </Stat>
                    </div>
                </Stats>
            </div>
            {/* <div className="xl-or-larger col-lg-12 col-xl-4"> */}
            <div className="col-lg-12 col-xl-4">
                <div className="collateral-padding" />
                <Collateral
                    l={total}
                    minted={mintedTotal}
                    b={b}
                    bRen={(numberOfDarknodes || new BigNumber(0)).times(100000)}
                    quoteCurrency={quoteCurrency}
                />
            </div>
        </div>
    );
};
