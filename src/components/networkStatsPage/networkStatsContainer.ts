import { useApolloClient } from "@apollo/react-hooks";
import { RenVMType } from "@renproject/interfaces";
import BigNumber from "bignumber.js";
import { Map, OrderedMap } from "immutable";
import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";

import { AllTokenDetails, Token } from "../../lib/ethereum/tokens";
import { isDefined } from "../../lib/general/isDefined";
import {
    getVolumes, normalizeSeriesVolumes, PeriodResponse, PeriodType, QuotePeriodResponse,
} from "../../lib/graphQL/volumes";
import { GraphContainer } from "../../store/graphStore";
import { NetworkContainer } from "../../store/networkContainer";
import { Web3Container } from "../../store/web3Store";
import { SECONDS } from "../common/BackgroundTasks";
import { Block, RenVMContainer } from "../renvmPage/renvmContainer";
import { StatTab } from "./StatTabs";

const useNetworkStatsContainer = () => {
    const client = useApolloClient();

    const { renNetwork } = Web3Container.useContainer();
    const { renVM } = GraphContainer.useContainer();
    const { numberOfDarknodes } = renVM || {};
    const { quoteCurrency, tokenPrices } = NetworkContainer.useContainer();
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

    const renTokenPriceMap = tokenPrices && tokenPrices.get(Token.REN, null);
    const renPrice = (renTokenPriceMap && renTokenPriceMap.get(quoteCurrency, null));

    const b = isDefined(numberOfDarknodes) && isDefined(renPrice) ? numberOfDarknodes.times(100000).times(renPrice) : null;

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
                    setPeriodSeries(currentPeriodSeries => currentPeriodSeries.set(period, null));
                    setPeriodSeriesUpdated(currentPeriodSeriesUpdated => currentPeriodSeriesUpdated.set(period, true));

                    let response: PeriodResponse;
                    try {
                        response = await getVolumes(renNetwork, client, period);
                    } catch (error) {
                        console.error(error);
                    }

                    // periodSeries = ;
                    setPeriodSeries(currentPeriodSeries => currentPeriodSeries.set(period, response));
                    setPeriodSeriesUpdated(currentPeriodSeriesUpdated => currentPeriodSeriesUpdated.set(period, true));
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
                setQuotePeriodSeries(currentQuotePeriodSeries => currentQuotePeriodSeries.set(period, normalizeSeriesVolumes(individualPeriodSeries, tokenPrices, quoteCurrency)));
                setPeriodSeriesUpdated(currentPeriodSeriesUpdated => currentPeriodSeriesUpdated.set(period, false));
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

    const volumePeriodSeries = quotePeriodSeries.get(volumePeriod);
    const lockedPeriodSeries = quotePeriodSeries.get(lockedPeriod);
    // const valueLockedOrAll = lockedPeriodSeries || quotePeriodSeries.get(PeriodType.ALL);

    return {
        volumePeriod, setVolumePeriod, volumePeriodSeries,
        quoteCurrency, volumeTab, lockedPeriod, setLockedPeriod, setVolumeTab,
        quotePeriodSeries, lockedPeriodSeries, lockedTab, setLockedTab,
        total, mintedTotal, b, numberOfDarknodes,
    };
};

export const NetworkStatsContainer = createContainer(useNetworkStatsContainer);
