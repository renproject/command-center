import { RenVMType } from "@renproject/interfaces";
import BigNumber from "bignumber.js";
import { Map, OrderedMap, OrderedSet } from "immutable";
import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";

import { AllTokenDetails, Token } from "../../../lib/ethereum/tokens";
import { isDefined } from "../../../lib/general/isDefined";
import { GraphClientContainer } from "../../../lib/graphQL/ApolloWithNetwork";
import {
    getVolumes,
    normalizeSeriesVolumes,
    PeriodType,
    QuoteSeriesData,
    SeriesData,
    VolumeNetwork,
} from "../../../lib/graphQL/volumes";
import { GraphContainer } from "../../../store/graphContainer";
import { NetworkContainer } from "../../../store/networkContainer";
import { Web3Container } from "../../../store/web3Container";
import { SECONDS } from "../../common/BackgroundTasks";
import { Block, RenVMContainer } from "../renvmStatsPage/renvmContainer";
import { StatTab } from "./StatTabs";

export enum NetworkStatsChain {
    // All = "All",
    Ethereum = "Ethereum",
    BinanceSmartChain = "Binance Smart Chain",
}

const useNetworkStatsContainer = () => {
    const { ethereumSubgraph, bscSubgraph } =
        GraphClientContainer.useContainer();

    const { renNetwork } = Web3Container.useContainer();
    const { renVM, getLatestSyncedBlock, getLatestSyncedBlockBSC } =
        GraphContainer.useContainer();
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

    const firstBlock = container.blocks
        ? container.blocks.first<Block | null>(null)
        : null;

    // For each locked token, create a <Stat> element
    let lockedBalances: OrderedMap<Token, BigNumber> = OrderedMap();
    let total = new BigNumber(0);
    if (firstBlock && firstBlock.prevState && firstBlock.prevState.map) {
        firstBlock.prevState
            // .map(state => { const { name, ...restOfA } = state; return { ...restOfA, name: state.name.replace("UTXOs", "").toUpperCase() as Token }; })
            .map((state) => {
                if (state.type === RenVMType.ExtTypeBtcCompatUTXOs) {
                    const token = state.name
                        .replace("UTXOs", "")
                        .toUpperCase() as Token;
                    if (tokenPrices === null) {
                        lockedBalances = lockedBalances.set(
                            token,
                            new BigNumber(0),
                        );
                        return null;
                    }

                    const tokenPriceMap = tokenPrices.get(token, undefined);
                    if (!tokenPriceMap) {
                        lockedBalances = lockedBalances.set(
                            token,
                            new BigNumber(0),
                        );
                        return null;
                    }

                    const price = tokenPriceMap.get(quoteCurrency, undefined);
                    if (!price) {
                        lockedBalances = lockedBalances.set(
                            token,
                            new BigNumber(0),
                        );
                        return null;
                    }

                    const tokenDetails = AllTokenDetails.get(token, undefined);
                    const decimals = tokenDetails
                        ? new BigNumber(
                              tokenDetails.decimals.toString(),
                          ).toNumber()
                        : 0;

                    const amount = new BigNumber(
                        state && state.value
                            ? state.value
                                  .reduce(
                                      (sum, utxo) =>
                                          sum.plus(utxo.amount || "0"),
                                      new BigNumber(0),
                                  )
                                  .toFixed()
                            : 0,
                    ).div(new BigNumber(Math.pow(10, decimals)));

                    lockedBalances = lockedBalances.set(
                        token,
                        amount.times(price),
                    );
                    total = total.plus(
                        lockedBalances.get(token, new BigNumber(0)),
                    );
                    return null;
                }
                return null;
            });
    }

    lockedBalances = lockedBalances.sortBy((_value, key) =>
        Object.keys(Token).indexOf(key),
    );

    const renTokenPriceMap = tokenPrices && tokenPrices.get(Token.REN, null);
    const renPrice =
        renTokenPriceMap && renTokenPriceMap.get(quoteCurrency, null);

    const b =
        isDefined(numberOfDarknodes) && isDefined(renPrice)
            ? numberOfDarknodes.times(100000).times(renPrice)
            : null;

    const [volumePeriod, setVolumePeriod] = useState<PeriodType>(
        PeriodType.ALL,
    );
    const [lockedPeriod, setLockedPeriod] = useState<PeriodType>(
        PeriodType.ALL,
    );

    const [volumeTab, setVolumeTab] = useState<StatTab>(StatTab.History);
    const [lockedTab, setLockedTab] = useState<StatTab>(StatTab.History);

    const [volumeSelectedChain, setVolumeSelectedChain] = useState(
        NetworkStatsChain.Ethereum,
    );
    const [lockedSelectedChain, setLockedSelectedChain] = useState(
        NetworkStatsChain.Ethereum,
    );

    const [periodSeries, setPeriodSeries] = useState<
        Map<NetworkStatsChain, Map<PeriodType, SeriesData | null | undefined>>
    >(Map<NetworkStatsChain, Map<PeriodType, SeriesData | null | undefined>>());
    // periodSeriesUpdated indicated whether the quote values should be
    // recalculated for the period series.
    const [periodSeriesUpdated, setPeriodSeriesUpdated] = useState<
        Map<NetworkStatsChain, Map<PeriodType, boolean>>
    >(Map<NetworkStatsChain, Map<PeriodType, boolean>>());
    const [pricesUpdated, setPricesUpdated] = useState(false);

    useEffect(() => {
        setPricesUpdated(true);
    }, [tokenPrices, quoteCurrency]);

    useEffect(() => {
        (async () => {
            for (const [period, chain] of OrderedSet([
                [volumePeriod, volumeSelectedChain] as const,
                [lockedPeriod, lockedSelectedChain] as const,
            ]).toArray()) {
                if (periodSeries.get(chain, Map()).get(period) === undefined) {
                    setPeriodSeries((currentPeriodSeries) =>
                        currentPeriodSeries.set(
                            chain,
                            currentPeriodSeries
                                .get(
                                    chain,
                                    Map<
                                        PeriodType,
                                        SeriesData | null | undefined
                                    >(),
                                )
                                .set(period, null),
                        ),
                    );
                    setPeriodSeriesUpdated((currentPeriodSeriesUpdated) =>
                        currentPeriodSeriesUpdated.set(
                            chain,
                            currentPeriodSeriesUpdated
                                .get(chain, Map<PeriodType, boolean>())
                                .set(period, true),
                        ),
                    );

                    // TODO: Refactor multiple networks.
                    let response: SeriesData;
                    try {
                        if (chain === NetworkStatsChain.Ethereum) {
                            const latestBlock = await getLatestSyncedBlock();
                            response = await getVolumes(
                                renNetwork.isTestnet
                                    ? VolumeNetwork.EthereumTestnet
                                    : VolumeNetwork.Ethereum,
                                ethereumSubgraph,
                                period,
                                latestBlock,
                            );
                        } else {
                            const latestBlock = await getLatestSyncedBlockBSC();
                            response = await getVolumes(
                                renNetwork.isTestnet
                                    ? VolumeNetwork.BSCTestnet
                                    : VolumeNetwork.BSC,
                                bscSubgraph,
                                period,
                                // Round down latest block to improve caching.
                                latestBlock - (latestBlock % 200),
                                20,
                            );
                        }
                    } catch (error) {
                        console.error(error);
                    }

                    setPeriodSeries((currentPeriodSeries) =>
                        currentPeriodSeries.set(
                            chain,
                            currentPeriodSeries
                                .get(
                                    chain,
                                    Map<
                                        PeriodType,
                                        SeriesData | null | undefined
                                    >(),
                                )
                                .set(period, response),
                        ),
                    );
                    setPeriodSeriesUpdated((currentPeriodSeriesUpdated) =>
                        currentPeriodSeriesUpdated.set(
                            chain,
                            currentPeriodSeriesUpdated
                                .get(chain, Map<PeriodType, boolean>())
                                .set(period, true),
                        ),
                    );
                }
            }
        })().catch(console.error);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [volumePeriod, lockedPeriod, volumeSelectedChain, lockedSelectedChain]);

    const [quotePeriodSeries, setQuotePeriodSeries] = useState<
        Map<NetworkStatsChain, Map<PeriodType, QuoteSeriesData>>
    >(Map<NetworkStatsChain, Map<PeriodType, QuoteSeriesData>>());
    useEffect(() => {
        for (const chain of [
            NetworkStatsChain.Ethereum,
            NetworkStatsChain.BinanceSmartChain,
        ]) {
            for (const period of [
                PeriodType.DAY,
                PeriodType.HOUR,
                PeriodType.MONTH,
                PeriodType.WEEK,
                PeriodType.YEAR,
                PeriodType.ALL,
            ]) {
                const individualPeriodSeries = periodSeries
                    .get(
                        chain,
                        Map<PeriodType, SeriesData | null | undefined>(),
                    )
                    .get(period);
                if (
                    tokenPrices &&
                    individualPeriodSeries &&
                    (periodSeriesUpdated
                        .get(chain, Map<PeriodType, boolean>())
                        .get(period) ||
                        pricesUpdated)
                ) {
                    setQuotePeriodSeries((currentQuotePeriodSeries) =>
                        currentQuotePeriodSeries.set(
                            chain,
                            currentQuotePeriodSeries
                                .get(chain, Map<PeriodType, QuoteSeriesData>())
                                .set(
                                    period,
                                    normalizeSeriesVolumes(
                                        individualPeriodSeries,
                                        tokenPrices,
                                        quoteCurrency,
                                    ),
                                ),
                        ),
                    );
                    setPeriodSeriesUpdated((currentPeriodSeriesUpdated) =>
                        currentPeriodSeriesUpdated.set(
                            chain,
                            currentPeriodSeriesUpdated
                                .get(chain, Map<PeriodType, boolean>())
                                .set(period, false),
                        ),
                    );
                }
            }
        }
        setPricesUpdated(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [periodSeries, pricesUpdated]);

    const allPeriod = quotePeriodSeries
        .get(NetworkStatsChain.Ethereum, Map<PeriodType, QuoteSeriesData>())
        .get(PeriodType.ALL);
    let mintedTotal = new BigNumber(0);
    if (allPeriod) {
        mintedTotal = new BigNumber(
            allPeriod.difference.quoteLockedTotal || "0",
        );
    }

    return {
        volumePeriod,
        setVolumePeriod,
        quoteCurrency,
        volumeTab,
        lockedPeriod,
        setLockedPeriod,
        setVolumeTab,
        periodSeries,
        quotePeriodSeries,
        lockedTab,
        setLockedTab,
        total,
        mintedTotal,
        b,
        numberOfDarknodes,
        volumeSelectedChain,
        setVolumeSelectedChain,
        lockedSelectedChain,
        setLockedSelectedChain,
    };
};

export const NetworkStatsContainer = createContainer(useNetworkStatsContainer);
