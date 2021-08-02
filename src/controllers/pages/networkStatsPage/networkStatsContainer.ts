import BigNumber from "bignumber.js";
import { Map, OrderedMap, OrderedSet } from "immutable";
import { useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import { queryState, RenVMState } from "../../../lib/darknode/jsonrpc";
import {
    AllTokenDetails,
    chainToToken,
    Token,
} from "../../../lib/ethereum/tokens";
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
import { getLightnode } from "../../../store/mapContainer";
import { NetworkContainer } from "../../../store/networkContainer";
import { Web3Container } from "../../../store/web3Container";
import { SECONDS } from "../../common/BackgroundTasks";
import { StatTab } from "./StatTabs";

export enum NetworkStatsChain {
    // All = "All",
    Ethereum = "Ethereum",
    BinanceSmartChain = "Binance Smart Chain",
    Fantom = "Fantom",
    Polygon = "Polygon",
    Avalanche = "Avalanche",
}

const useNetworkStatsContainer = () => {
    const {
        ethereumSubgraph,
        bscSubgraph,
        fantomSubgraph,
        polygonSubgraph,
    } = GraphClientContainer.useContainer();

    const { renNetwork } = Web3Container.useContainer();
    const {
        renVM,
        getLatestSyncedBlock,
        getLatestSyncedBlockBSC,
        getLatestSyncedBlockFantom,
        getLatestSyncedBlockPolygon,
    } = GraphContainer.useContainer();
    const { numberOfDarknodes } = renVM || {};
    const { quoteCurrency, tokenPrices } = NetworkContainer.useContainer();

    const [renVMState, setRenVMState] = useState<RenVMState | null>(null);

    const updateBlocksInterval = 120 * SECONDS;
    useEffect(() => {
        (async () => {
            const lightnode = getLightnode(renNetwork);
            if (!lightnode) {
                throw new Error(`No lightnode to fetch darknode locations.`);
            }
            setRenVMState(await queryState(lightnode));
        })().catch(console.error);

        const interval = setInterval(() => {
            (async () => {
                const lightnode = getLightnode(renNetwork);
                if (!lightnode) {
                    throw new Error(
                        `No lightnode to fetch darknode locations.`,
                    );
                }
                setRenVMState(await queryState(lightnode));
            })().catch(console.error);
        }, updateBlocksInterval);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 120 seconds

    // const firstBlock = container.blocks
    //     ? container.blocks.first<Block | null>(null)
    //     : null;

    // For each locked token, create a <Stat> element
    let lockedBalances: OrderedMap<Token, BigNumber> = OrderedMap();
    let total = new BigNumber(0);
    if (renVMState) {
        Object.keys(renVMState.state)
            // .map(state => { const { name, ...restOfA } = state; return { ...restOfA, name: state.name.replace("UTXOs", "").toUpperCase() as Token }; })
            .map((chain) => {
                const token = chainToToken[chain];
                if (!token) {
                    return null;
                }
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
                    ? new BigNumber(tokenDetails.decimals.toString()).toNumber()
                    : 0;

                const output = renVMState.state[chain].output;
                const amount = new BigNumber(output ? output.value : 0).div(
                    new BigNumber(Math.pow(10, decimals)),
                );

                lockedBalances = lockedBalances.set(token, amount.times(price));
                total = total.plus(lockedBalances.get(token, new BigNumber(0)));
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
                        } else if (
                            chain === NetworkStatsChain.BinanceSmartChain
                        ) {
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
                        } else if (chain === NetworkStatsChain.Fantom) {
                            const latestBlock = await getLatestSyncedBlockFantom();
                            response = await getVolumes(
                                VolumeNetwork.Fantom,
                                fantomSubgraph,
                                period,
                                // Round down latest block to improve caching.
                                latestBlock - (latestBlock % 200),
                                20,
                            );
                        } else if (chain === NetworkStatsChain.Polygon) {
                            const latestBlock = await getLatestSyncedBlockPolygon();
                            response = await getVolumes(
                                VolumeNetwork.Polygon,
                                polygonSubgraph,
                                period,
                                // Round down latest block to improve caching.
                                latestBlock - (latestBlock % 200),
                                20,
                            );
                        } else {
                            throw new Error(
                                `Unsupported chain ${String(chain)}.`,
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
            NetworkStatsChain.Fantom,
            NetworkStatsChain.Polygon,
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
