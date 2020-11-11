import { CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useMemo } from "react";

import { PeriodType, QuotePeriodResponse } from "../../../lib/graphQL/volumes";
import { ReactComponent as IconValueLocked } from "../../../styles/images/icon-value-locked.svg";
import { ReactComponent as IconVolume } from "../../../styles/images/icon-volume.svg";
import { Change } from "../../../views/Change";
import { Stat, Stats } from "../../../views/Stat";
import { Collateral } from "./Collateral";
import { GraphType, HistoryChart } from "./HistoryChart";
import { NetworkStatsContainer } from "./networkStatsContainer";
import { PeriodSelector } from "./PeriodSelector";
import { StatTab, StatTabs } from "./StatTabs";
import { TokenChart } from "./TokenChart";

export const getPeriodPercentChange = (
  periodType: PeriodType,
  property: "quoteTotalVolume" | "quoteTotalLocked",
  periodData?: QuotePeriodResponse
) => {
  if (
    periodType !== PeriodType.ALL &&
    periodData?.historic &&
    periodData?.historic.length > 1
  ) {
    const historic = periodData?.historic;
    const prev = historic[0];
    const curr = historic[historic.length - 1];
    return new BigNumber(curr[property])
      .minus(prev[property])
      .dividedBy(curr[property])
      .multipliedBy(100);
  }
  return null;
};

export const NetworkStats = () => {
  const {
    volumePeriod,
    setVolumePeriod,
    volumePeriodSeries,
    quoteCurrency,
    volumeTab,
    lockedPeriod,
    setLockedPeriod,
    setVolumeTab,
    quotePeriodSeries,
    lockedTab,
    setLockedTab,
    lockedPeriodSeries,
    total,
    mintedTotal,
    b,
    numberOfDarknodes,
  } = NetworkStatsContainer.useContainer();
  const quoteVolumePeriod = quotePeriodSeries.get(volumePeriod);
  const quoteLockedPeriod = quotePeriodSeries.get(lockedPeriod);
  const [, totalLockedPercentChange] = useMemo(() => {
    const volumeChange = getPeriodPercentChange(
      volumePeriod,
      "quoteTotalVolume",
      quoteVolumePeriod
    );
    const lockedChange = getPeriodPercentChange(
      lockedPeriod,
      "quoteTotalLocked",
      quoteLockedPeriod
    );
    return [volumeChange, lockedChange];
  }, [volumePeriod, quoteVolumePeriod, lockedPeriod, quoteLockedPeriod]);

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
                      : `1${volumePeriod.slice(0, 1).toUpperCase()}`}
                    )
                  </span>
                </>
              }
              icon={<IconVolume />}
              big={true}
              infoLabel={<>Total amount of volume transacted via RenVM.</>}
              className="stat--extra-big"
            >
              {volumePeriodSeries ? (
                <div>
                  <span className="stat-amount">
                    <CurrencyIcon currency={quoteCurrency} />
                    <span className="stat-amount--value">
                      {new BigNumber(
                        volumePeriodSeries.average.quotePeriodVolume
                      ).toFormat(2)}
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
                {volumeTab === StatTab.History ? (
                  <HistoryChart
                    graphType={GraphType.TotalVolume}
                    periodSeries={quoteVolumePeriod}
                    quoteCurrency={quoteCurrency}
                  />
                ) : (
                  <TokenChart
                    graphType="Volume"
                    quoteCurrency={quoteCurrency}
                    periodSeries={quoteVolumePeriod}
                  />
                )}
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
                    The total value (TVL) of all digital assets currently minted
                    on Ethereum by RenVM.
                  </>
                ) : (
                  <>
                    The 1 {lockedPeriod.toLowerCase()} change in RenVM's locked
                    digital assets.
                  </>
                )
              }
              big={true}
              className="stat--extra-big"
            >
              {lockedPeriodSeries ? (
                <div>
                  <span className="stat-amount">
                    <CurrencyIcon currency={quoteCurrency} />
                    <span className="stat-amount--value">
                      {new BigNumber(
                        lockedPeriodSeries.average.quotePeriodLocked
                      ).toFormat(2)}
                    </span>
                  </span>
                  {totalLockedPercentChange !== null && (
                    <Change
                      className="stat--children--diff"
                      change={totalLockedPercentChange.toFormat(2)}
                    >
                      %
                    </Change>
                  )}
                </div>
              ) : (
                <Loading alt />
              )}
              <div className="overview--bottom">
                <StatTabs
                  selected={lockedTab}
                  onChange={setLockedTab}
                  volumePeriod={lockedPeriod}
                  assetsPeriod={null}
                />
                {lockedTab === StatTab.History ? (
                  <HistoryChart
                    graphType={GraphType.TotalLocked}
                    periodSeries={quoteLockedPeriod}
                    quoteCurrency={quoteCurrency}
                  />
                ) : (
                  <TokenChart
                    graphType={"Locked"}
                    quoteCurrency={quoteCurrency}
                    periodSeries={quoteLockedPeriod}
                  />
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
