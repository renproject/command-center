import { CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React from "react";

import { PeriodType } from "../../lib/graphQL/volumes";
import { ReactComponent as IconValueLocked } from "../../styles/images/icon-value-locked.svg";
import { ReactComponent as IconVolume } from "../../styles/images/icon-volume.svg";
import { Stat, Stats } from "../../views/Stat";
import { Collateral } from "./Collateral";
import { HistoryChart } from "./HistoryChart";
import { NetworkStatsContainer } from "./networkStatsContainer";
import { PeriodSelector } from "./PeriodSelector";
import { StatTab, StatTabs } from "./StatTabs";
import { TokenChart } from "./TokenChart";

export const NetworkStats = () => {

    const {
        volumePeriod, setVolumePeriod, volumePeriodSeries,
        quoteCurrency, volumeTab, lockedPeriod, setLockedPeriod, setVolumeTab,
        quotePeriodSeries, lockedTab, setLockedTab, lockedPeriodSeries,
        total, mintedTotal, b, numberOfDarknodes,
    } = NetworkStatsContainer.useContainer();

    return (
        <div className="network-stats container">
            {/* <div className="no-xl-or-larger col-lg-12 col-xl-4">
                <div className="collateral-padding" />
                {collateral}
            </div> */}

            <div className="col-lg-12 col-xl-8">
                <Stats>
                    <div className="stat-with-period">
                        <PeriodSelector selected={volumePeriod} onChange={setVolumePeriod} />
                        <Stat
                            message={<>Volume <span className="stat--subtitle">({volumePeriod === PeriodType.ALL ? volumePeriod : `1${volumePeriod.slice(0, 1).toUpperCase()}`})</span></>}
                            icon={<IconVolume />}
                            big={true}
                            infoLabel={<>Total amount of volume transacted via RenVM.</>}
                            className="stat--extra-big"
                        >
                            {volumePeriodSeries ? <><CurrencyIcon currency={quoteCurrency} />{new BigNumber(volumePeriodSeries.average.quotePeriodVolume).toFormat(2)}{/*<TokenBalance
                            token={Token.ETH}
                            convertTo={quoteCurrency}
                            amount={previousSummed}
                        />*/}</> : <Loading alt />}
                            <div className="overview--bottom">
                                <StatTabs selected={volumeTab} onChange={setVolumeTab} volumePeriod={volumePeriod} assetsPeriod={volumePeriod} />
                                {volumeTab === StatTab.History ?
                                    <HistoryChart graphType={"TotalVolume"} periodSeries={quotePeriodSeries.get(volumePeriod)} quoteCurrency={quoteCurrency} /> :
                                    <TokenChart graphType={"Volume"} quoteCurrency={quoteCurrency} periodSeries={quotePeriodSeries.get(volumePeriod)} />
                                }
                            </div>
                        </Stat>
                    </div>
                    <div className="stat-with-period">
                        <PeriodSelector selected={lockedPeriod} onChange={setLockedPeriod} />
                        <Stat
                            message="Value locked"
                            icon={<IconValueLocked />}
                            infoLabel={lockedPeriod === PeriodType.ALL ? <>The total value (TVL) of all digital assets currently locked in RenVM.</> : <>The 1 {lockedPeriod.toLowerCase()} change in RenVM's locked digital assets.</>}
                            big={true}
                            className="stat--extra-big"
                        >
                            {lockedPeriodSeries ? <><CurrencyIcon currency={quoteCurrency} />{new BigNumber(lockedPeriodSeries.average.quotePeriodLocked).toFormat(2)}
                                {/* {total ? <> */}
                                {/* <CurrencyIcon currency={quoteCurrency} /> */}
                                {/* {total.toFormat(2)}{/*<TokenBalance */}
                                {/* token={Token.ETH} */}
                                {/* convertTo={quoteCurrency} */}
                                {/* amount={currentSummed} */}
                                {/* />*/}
                            </> : <Loading alt />}
                            <div className="overview--bottom">
                                <StatTabs selected={lockedTab} onChange={setLockedTab} volumePeriod={lockedPeriod} assetsPeriod={null} />
                                {lockedTab === StatTab.History ?
                                    <HistoryChart graphType={"TotalLocked"} periodSeries={quotePeriodSeries.get(lockedPeriod)} quoteCurrency={quoteCurrency} /> :
                                    <TokenChart graphType={"Locked"} quoteCurrency={quoteCurrency} periodSeries={quotePeriodSeries.get(lockedPeriod)} />
                                }
                            </div>
                        </Stat>
                    </div>
                </Stats>
            </div>
            {/* <div className="xl-or-larger col-lg-12 col-xl-4"> */}
            <div className="col-lg-12 col-xl-4">
                <div className="collateral-padding" />
                <Collateral l={total} minted={mintedTotal} b={b} bRen={(numberOfDarknodes || new BigNumber(0)).times(100000)} quoteCurrency={quoteCurrency} />
            </div>
        </div>
    );
};
