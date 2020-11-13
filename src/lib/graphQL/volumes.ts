import { ApolloClient, gql } from "@apollo/react-hooks";
import {
    renMainnet,
    RenNetwork,
    RenNetworkDetails,
} from "@renproject/contracts";
import { Currency } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { List, Map, OrderedMap } from "immutable";
import moment from "moment";

import { AllTokenDetails, Token, TokenPrices } from "../ethereum/tokens";
import {
    PeriodData,
    QUERY_BLOCK,
    QUERY_RENVM_HISTORY,
    RawRenVM,
} from "./queries";

export enum PeriodType {
    HOUR = "HOUR",
    DAY = "DAY",
    WEEK = "WEEK",
    MONTH = "MONTH",
    YEAR = "YEAR",
    ALL = "ALL",
}

const getNetworkStart = (renNetwork: RenNetworkDetails) => {
    switch (renNetwork.name) {
        case RenNetwork.Devnet:
            return "2020-03-23T00+00";
        case RenNetwork.Testnet:
            return "2020-04-15T00+00";
        case RenNetwork.Mainnet:
        default:
            return "2020-05-27T00+00";
    }
};

export const getPeriodTimespan = (
    type: string,
    renNetwork: RenNetworkDetails = renMainnet,
): number => {
    const minutes = 60; // 60 seconds
    const hours = 60 * minutes;
    const days = 24 * hours;
    const weeks = 7 * days;
    const months = 31 * days;
    const years = 365 * days;

    switch (type) {
        case PeriodType.HOUR:
            return 1 * hours;
        case PeriodType.DAY:
            return 1 * days;
        case PeriodType.WEEK:
            return 1 * weeks;
        case PeriodType.MONTH:
            return 1 * months;
        case PeriodType.YEAR:
            return 1 * years;
        case PeriodType.ALL:
            // Mar-24-2020 11:22:40 PM UTC
            // return Math.floor(moment().diff("2020-03-24T00+00") / 1000);
            return Math.floor(
                moment().diff(getNetworkStart(renNetwork)) / 1000,
            );
        default:
            throw new Error(`Unknown period type ${type}`);
    }
};

export interface SeriesData {
    series: Array<Partial<PeriodData>>;
    difference: Partial<PeriodData>;
}

export const getVolumes = async (
    renNetwork: RenNetworkDetails,
    client: ApolloClient<unknown>,
    periodType: PeriodType,
): Promise<SeriesData> => {
    const now = moment().unix();

    const latestBlockResponse = await client.query<{
        renVM: {
            activeBlock: string;
            activeTimestamp: string;
        };
    }>({
        query: QUERY_BLOCK,
    });

    const activeBlock = new BigNumber(
        latestBlockResponse.data.renVM.activeBlock,
    ).toNumber();
    const activeTimestamp = new BigNumber(
        latestBlockResponse.data.renVM.activeTimestamp,
    ).toNumber();

    // TODO: Calculate dynamically or search for date in subgraph.
    const blockTime = 13; // seconds

    // Allow 30 blocks for the subgraph to sync blocks. This also matches the
    // time for burns to be considered final in RenVM on mainnet.
    // currentBlock = currentBlock - 30;

    // Calculate the steps so that there are 30 segments show on the graph.
    // An extra segment is fetched at the start to calculate the volume of
    // the first segment.
    const periodSecondsCount = getPeriodTimespan(periodType, renNetwork);
    const startingBlock =
        activeBlock -
        (periodSecondsCount - (now - activeTimestamp)) / blockTime;
    // currentBlock - (periodSecondsCount / blockTime);
    const segmentCount = 50;
    const segmentLength = Math.ceil(
        (activeBlock - startingBlock) / segmentCount,
    );
    const blocks = Array.from(new Array(segmentCount + 1)).map(
        (_, i) => activeBlock - (segmentCount - i) * segmentLength,
    );

    // Build GraphQL query containing a request for each of the blocks.
    const query = gql(`
{
      ${blocks.map((block) => QUERY_RENVM_HISTORY(block)).join("\n")}
}
  `);

    const responseAlt = await client.query<{
        [block: string]: RawRenVM | null;
    }>({
        query,
    });

    interface Row extends Partial<RawRenVM> {
        id: string;
        blockNumber: number;
    }

    // Add block number to each result.
    const responseRows = List<Row>(
        Object.keys(responseAlt.data).map((rowID) => {
            const blockData = responseAlt.data[rowID];
            let blockNumber = 0;
            // Extract numerical block number from ID. `rowID` follows the pattern
            // `block_1234`.
            try {
                const match = rowID.match(/\d+/);
                blockNumber = parseInt(match ? match[0] : "0", 10);
            } catch (error) {
                console.error(error);
            }

            return {
                ...blockData,
                id: rowID,
                blockNumber,
            };
        }),
    ).sortBy((item) => item.blockNumber);

    const getFieldDifference = <K extends string>(
        first: { [key in K]?: string | undefined } | undefined,
        last: { [key in K]?: string | undefined } | undefined,
        field: K,
    ): string => {
        const endF = (last && last[field] ? last[field] : "0") as string;
        const startF = (first && first[field] ? first[field] : "0") as string;
        return new BigNumber(endF).minus(startF).toFixed();
    };

    const tokenArrayToMap = <T extends { symbol: string }>(
        array: T[],
    ): OrderedMap<string, T> =>
        array.reduce(
            (acc, tokenLocked) =>
                acc.set(tokenLocked.symbol.replace(/^ren/, ""), tokenLocked),
            OrderedMap<string, T>(),
        );

    // Calculate period volume by subtracting total volume between each
    // consecutive segment.
    const series = Array.from(new Array(segmentCount)).map(
        (_, i): Partial<PeriodData> => {
            // tslint:disable-next-line: no-non-null-assertion
            const first = responseRows.get(i)!;
            // tslint:disable-next-line: no-non-null-assertion
            const last = responseRows.get(i + 1)!;

            //   const isFirstRow = periodType === PeriodType.ALL && i === 0;

            //   const getFieldDiff = (field: string) =>
            //     new BigNumber(end ? end[field] : "0")
            //       .minus(start && !isFirstRow ? start[field] : "0")
            //       .toFixed();

            return {
                ...last,

                currentEpoch:
                    (first && first.currentEpoch) ||
                    (last && last.currentEpoch) ||
                    (null as any),
                previousEpoch:
                    (first && first.previousEpoch) ||
                    (last && last.previousEpoch) ||
                    (null as any),

                id: last.id, // "HOUR441028";
                date:
                    (activeTimestamp -
                        (activeBlock - last.blockNumber) * blockTime) *
                    1000, // 1587700800;,

                volume: tokenArrayToMap(last.volume || first.volume || []),
                locked: tokenArrayToMap(last.locked || first.locked || []),
            };
        },
    );

    const start = responseRows.first(undefined);
    const end = responseRows.last(undefined);

    const difference: PeriodData = {
        currentEpoch:
            (start && start.currentEpoch) ||
            (end && end.currentEpoch) ||
            (null as any),
        previousEpoch:
            (start && start.previousEpoch) ||
            (end && end.previousEpoch) ||
            (null as any),

        id: end ? end.id : "", // "HOUR441028";
        date:
            (activeTimestamp -
                (activeBlock - (end ? end.blockNumber : 0)) * blockTime) *
            1000, // 1587700800;

        numberOfDarknodes: getFieldDifference(start, end, "numberOfDarknodes"),
        numberOfDarknodesLastEpoch: getFieldDifference(
            start,
            end,
            "numberOfDarknodesLastEpoch",
        ),
        numberOfDarknodesNextEpoch: getFieldDifference(
            start,
            end,
            "numberOfDarknodesNextEpoch",
        ),
        minimumBond: getFieldDifference(start, end, "minimumBond"),
        minimumEpochInterval: getFieldDifference(
            start,
            end,
            "minimumEpochInterval",
        ),
        currentCycle: getFieldDifference(start, end, "currentCycle"),
        previousCycle: getFieldDifference(start, end, "previousCycle"),
        deregistrationInterval: getFieldDifference(
            start,
            end,
            "deregistrationInterval",
        ),

        btcMintFee: getFieldDifference(start, end, "btcMintFee"),
        btcBurnFee: getFieldDifference(start, end, "btcBurnFee"),
        zecMintFee: getFieldDifference(start, end, "zecMintFee"),
        zecBurnFee: getFieldDifference(start, end, "zecBurnFee"),
        bchMintFee: getFieldDifference(start, end, "bchMintFee"),
        bchBurnFee: getFieldDifference(start, end, "bchBurnFee"),

        volume: tokenArrayToMap((end && end.volume) || []).map(
            (endTokenVolume, symbol) => ({
                symbol,
                amount: getFieldDifference(
                    tokenArrayToMap((start && start.volume) || []).get(symbol),
                    endTokenVolume,
                    "amount",
                ),
                amountInEth: getFieldDifference(
                    tokenArrayToMap((start && start.volume) || []).get(symbol),
                    endTokenVolume,
                    "amountInEth",
                ),
                amountInUsd: getFieldDifference(
                    tokenArrayToMap((start && start.volume) || []).get(symbol),
                    endTokenVolume,
                    "amountInUsd",
                ),
            }),
        ),

        locked: tokenArrayToMap((end && end.locked) || []).map(
            (endTokenLocked, symbol) => ({
                symbol,
                amount: getFieldDifference(
                    tokenArrayToMap((start && start.locked) || []).get(symbol),
                    endTokenLocked,
                    "amount",
                ),
                amountInUsd: getFieldDifference(
                    tokenArrayToMap((start && start.locked) || []).get(symbol),
                    endTokenLocked,
                    "amountInUsd",
                ),
                // asset: endTokenLocked.asset,
            }),
        ),
    };

    return {
        series,
        difference,
    };
};

export interface QuotePeriodData extends PeriodData {
    // Total
    quoteLockedTotal: string;
    quoteLockedTotalHistoric: string;
    quoteVolumeTotal: string;

    quoteLocked: {
        [token: string]: BigNumber;
    };

    quoteVolume: {
        [token: string]: BigNumber;
    };
}

const normalizeVolumes = (
    periodData: Partial<PeriodData>,
    tokenPrices: TokenPrices,
    quoteCurrency: Currency,
): Partial<QuotePeriodData> => {
    const data = {
        ...periodData,
        quoteLockedTotal: new BigNumber(0),
        quoteLockedTotalHistoric: new BigNumber(0),
        quoteVolumeTotal: new BigNumber(0),
        quoteLocked: {},
        quoteVolume: {},
    };

    if (periodData.volume) {
        periodData.volume.forEach(
            ({ amount, amountInEth, amountInUsd }, symbol) => {
                // TODO: Fix subgraph to return asset decimals.
                const details = AllTokenDetails.get(symbol as Token);
                let tokenVolume: BigNumber;
                if (quoteCurrency === Currency.BTC) {
                    tokenVolume = new BigNumber(amount || "0")
                        .div(
                            new BigNumber(10).exponentiatedBy(
                                details ? details.decimals : 18,
                            ),
                        )
                        .times(
                            // Price should be 1 for BTC, variable for other
                            // assets.
                            tokenPrices
                                .get(symbol as Token, Map<Currency, number>())
                                .get(quoteCurrency) || 0,
                        )
                        .decimalPlaces(2);
                } else if (quoteCurrency === Currency.ETH) {
                    tokenVolume = new BigNumber(
                        amountInEth || "0",
                    ).decimalPlaces(2);
                } else {
                    tokenVolume = new BigNumber(amountInUsd || "0")
                        .dividedBy(
                            tokenPrices
                                .get(Token.BTC, Map<Currency, number>())
                                .get(Currency.USD) || 0,
                        )
                        .times(
                            tokenPrices
                                .get(Token.BTC, Map<Currency, number>())
                                .get(quoteCurrency) || 0,
                        )
                        .decimalPlaces(2);
                }
                data.quoteVolume[symbol] = tokenVolume;
                data.quoteVolumeTotal = data.quoteVolumeTotal.plus(tokenVolume);
            },
        );
    }

    if (periodData.locked) {
        periodData.locked.forEach(({ amount, amountInUsd }, symbol) => {
            // TODO: Fix subgraph to return asset decimals.
            const details = AllTokenDetails.get(symbol as Token);
            const tokenLocked: BigNumber = new BigNumber(amount || "0")
                .div(
                    new BigNumber(10).exponentiatedBy(
                        details ? details.decimals : 18,
                    ),
                )
                .times(
                    // Price should be 1 for BTC, variable for other
                    // assets.
                    tokenPrices
                        .get(symbol as Token, Map<Currency, number>())
                        .get(quoteCurrency) || 0,
                )
                .decimalPlaces(2);
            const tokenLockedHistoric = new BigNumber(amountInUsd || "0")
                .dividedBy(
                    tokenPrices
                        .get(Token.BTC, Map<Currency, number>())
                        .get(Currency.USD) || 0,
                )
                .times(
                    tokenPrices
                        .get(Token.BTC, Map<Currency, number>())
                        .get(quoteCurrency) || 0,
                )
                .decimalPlaces(2);
            data.quoteLocked[symbol] = tokenLocked;
            data.quoteLockedTotal = data.quoteLockedTotal.plus(tokenLocked);
            data.quoteLockedTotalHistoric = data.quoteLockedTotalHistoric.plus(
                tokenLockedHistoric,
            );
        });
    }

    return {
        ...data,
        // total
        quoteLockedTotal: data.quoteLockedTotal.toFixed(2),
        quoteVolumeTotal: data.quoteVolumeTotal.toFixed(2),
        quoteLockedTotalHistoric: data.quoteLockedTotalHistoric.toFixed(2),
    };
};

export interface QuoteSeriesData {
    series: Array<Partial<QuotePeriodData>>;
    difference: Partial<QuotePeriodData>;
}

export const normalizeSeriesVolumes = (
    seriesData: SeriesData,
    tokenPrices: TokenPrices,
    quoteCurrency: Currency,
): QuoteSeriesData => ({
    difference: normalizeVolumes(
        seriesData.difference,
        tokenPrices,
        quoteCurrency,
    ),
    series: seriesData.series.map((item) =>
        normalizeVolumes(item, tokenPrices, quoteCurrency),
    ),
});
