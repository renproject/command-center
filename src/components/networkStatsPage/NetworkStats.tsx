import { useApolloClient } from "@apollo/react-hooks";
import { RenVMType } from "@renproject/interfaces";
import { CurrencyIcon, Loading } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { Map, OrderedMap } from "immutable";
import React, { useEffect, useState } from "react";

import { AllTokenDetails, OldToken, Token } from "../../lib/ethereum/tokens";
import {
    getVolumes, normalizeSeriesVolumes, PeriodResponse, PeriodType, QuotePeriodResponse,
} from "../../lib/graphQL/volumes";
import { NetworkStateContainer } from "../../store/networkStateContainer";
import { ReactComponent as IconValueLocked } from "../../styles/images/icon-value-locked.svg";
import { ReactComponent as IconVolume } from "../../styles/images/icon-volume.svg";
import { SECONDS } from "../common/BackgroundTasks";
import { Stat, Stats } from "../common/Stat";
import { Block, RenVMContainer } from "../renvmPage/renvmContainer";
import { Collateral } from "./Collateral";
import { HistoryChart } from "./HistoryChart";
import { PeriodSelector } from "./PeriodSelector";
import { StatTab, StatTabs } from "./StatTabs";
import { TokenChart } from "./TokenChart";

export const NetworkStats = () => {
    const client = useApolloClient();

    const { quoteCurrency, currentDarknodeCount, tokenPrices } = NetworkStateContainer.useContainer();
    const container = RenVMContainer.useContainer();

    const updateBlocksInterval = 120 * SECONDS;
    useEffect(() => {
        container.updateBlocks().catch(console.error);
        const interval = setInterval(() => {
            container.updateBlocks().catch(console.error);
        }, updateBlocksInterval);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 120 seconds

    const firstBlock = container.blocks ? container.blocks.first<Block | null>(null) : null;

    // For each locked token, create a <Stat> element
    // tslint:disable-next-line: no-any
    let lockedBalances: OrderedMap<Token, BigNumber> = OrderedMap();
    let total = new BigNumber(0);
    if (firstBlock && firstBlock.prevState && firstBlock.prevState.map) {
        firstBlock.prevState
            // .map(state => { const { name, ...restOfA } = state; return { ...restOfA, name: state.name.replace("UTXOs", "").toUpperCase() as Token }; })
            .map((state) => {
                if (state.type === RenVMType.ExtTypeBtcCompatUTXOs) {
                    const token = state.name.replace("UTXOs", "").toUpperCase() as Token;
                    if (tokenPrices === null) {
                        lockedBalances = lockedBalances.set(token, new BigNumber(0));
                        return null;
                    }

                    const tokenPriceMap = tokenPrices.get(token, undefined);
                    if (!tokenPriceMap) {
                        lockedBalances = lockedBalances.set(token, new BigNumber(0));
                        return null;
                    }

                    const price = tokenPriceMap.get(quoteCurrency, undefined);
                    if (!price) {
                        lockedBalances = lockedBalances.set(token, new BigNumber(0));
                        return null;
                    }

                    const tokenDetails = AllTokenDetails.get(token, undefined);
                    const decimals = tokenDetails ? new BigNumber(tokenDetails.decimals.toString()).toNumber() : 0;

                    const amount = new BigNumber(state && state.value ? state.value.reduce((sum, utxo) => sum.plus(utxo.amount || "0"), new BigNumber(0)).toFixed() : 0)
                        .div(new BigNumber(Math.pow(10, decimals)));

                    lockedBalances = lockedBalances.set(token, amount.times(price));
                    total = total.plus(lockedBalances.get(token, new BigNumber(0)));
                    return null;
                }
                return null;
            });
    }

    lockedBalances = lockedBalances.sortBy((_value, key) => Object.keys(Token).indexOf(key));

    const renTokenPriceMap = tokenPrices && tokenPrices.get(OldToken.REN, null);
    const renPrice = (renTokenPriceMap && renTokenPriceMap.get(quoteCurrency, null));

    const b = currentDarknodeCount !== null && renPrice !== null ? new BigNumber(currentDarknodeCount || 0).times(100000).times(renPrice) : null;

    const [volumePeriod, setVolumePeriod] = useState<PeriodType>(PeriodType.ALL);
    const [lockedPeriod, setLockedPeriod] = useState<PeriodType>(PeriodType.ALL);

    const [volumeTab, setVolumeTab] = useState<StatTab>(StatTab.DigitalAssets);
    const [lockedTab, setLockedTab] = useState<StatTab>(StatTab.History);

    const [periodSeries, setPeriodSeries] = useState<Map<PeriodType, PeriodResponse | null | undefined>>(Map<PeriodType, PeriodResponse | null | undefined>());
    // periodSeriesUpdated indicated whether the quote values should be
    // recalculated for the period series.
    const [periodSeriesUpdated, setPeriodSeriesUpdated] = useState<Map<PeriodType, boolean>>(Map<PeriodType, boolean>());
    const [pricesUpdated, setPricesUpdated] = useState(false);

    useEffect(() => {
        setPricesUpdated(true);
    }, [tokenPrices, quoteCurrency]);

    useEffect(() => {
        (async () => {
            for (const period of [volumePeriod, lockedPeriod]) {
                if (periodSeries.get(period) === undefined) {
                    setPeriodSeries(periodSeries.set(period, null));
                    setPeriodSeriesUpdated(periodSeriesUpdated.set(period, true));

                    let response;
                    try {
                        response = await getVolumes(client, period);
                    } catch (error) {
                        console.error(error);
                    }

                    // periodSeries = ;
                    setPeriodSeries(periodSeries.set(period, response));
                    setPeriodSeriesUpdated(periodSeriesUpdated.set(period, true));
                }
            }
        })().catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [volumePeriod, lockedPeriod]);

    const [quotePeriodSeries, setQuotePeriodSeries] = useState<Map<PeriodType, QuotePeriodResponse>>(Map<PeriodType, QuotePeriodResponse>());
    useEffect(() => {
        for (const period of [PeriodType.DAY, PeriodType.HOUR, PeriodType.MONTH, PeriodType.WEEK, PeriodType.YEAR, PeriodType.ALL]) {
            const individualPeriodSeries = periodSeries.get(period);
            if (tokenPrices && individualPeriodSeries && (periodSeriesUpdated.get(period) || pricesUpdated)) {
                setQuotePeriodSeries(quotePeriodSeries.set(period, normalizeSeriesVolumes(individualPeriodSeries, tokenPrices, quoteCurrency)));
                setPeriodSeriesUpdated(periodSeriesUpdated.set(period, false));
            }
        }
        setPricesUpdated(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periodSeries, pricesUpdated]);

    const allPeriod = quotePeriodSeries.get(PeriodType.ALL);
    let mintedTotal = new BigNumber(0);
    if (allPeriod) {
        mintedTotal = new BigNumber(allPeriod.average.quoteTotalLocked);
    }

    const collateral = <Collateral l={total} minted={mintedTotal} b={b} bRen={new BigNumber(currentDarknodeCount || 0).times(100000)} quoteCurrency={quoteCurrency} />;

    const volumePeriodSeries = quotePeriodSeries.get(volumePeriod);
    const lockedPeriodSeries = quotePeriodSeries.get(lockedPeriod);

    return (
        <div className="network-stats container">
            <div className="no-xl-or-larger col-lg-12 col-xl-4">
                <div className="collateral-padding" />
                {collateral}
            </div>

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
                                    <HistoryChart graphType={"PeriodVolume"} periodSeries={quotePeriodSeries.get(volumePeriod)} quoteCurrency={quoteCurrency} /> :
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
                            infoLabel={<>The total value (TVL) of all digital assets currently locked in RenVM.</>}
                            big={true}
                            className="stat--extra-big"
                        >
                            {lockedPeriodSeries ? <><CurrencyIcon currency={quoteCurrency} />{new BigNumber(lockedPeriodSeries.average.quoteTotalLocked).toFormat(2)}
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
            <div className="xl-or-larger col-lg-12 col-xl-4">
                <div className="collateral-padding" />
                {collateral}
            </div>
        </div>
    );
};
