import { mainnet, RenNetwork, RenNetworkDetails } from "@renproject/contracts";
import { Currency } from "@renproject/react-components";
import { ApolloClient, gql } from "apollo-boost";
import BigNumber from "bignumber.js";
import { List, Map } from "immutable";
import moment from "moment";

import { Token, TokenPrices } from "../ethereum/tokens";
import { PeriodData, QUERY_BLOCK } from "./queries";
import { QUERY_RENVM_HISTORY, RawRenVMHistoric } from "./queries/renVM";

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
    renNetwork: RenNetworkDetails = mainnet,
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

export interface PeriodResponse {
    historic: PeriodData[];
    average: PeriodData;
}

export const getVolumes = async (
    renNetwork: RenNetworkDetails,
    client: ApolloClient<unknown>,
    periodType: PeriodType,
): Promise<PeriodResponse> => {
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
    const blockTime = renNetwork.isTestnet ? 4 : 13; // seconds

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
    const segmentCount = 30;
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
        [block: string]: RawRenVMHistoric | null;
    }>({
        query,
    });

    // Add block number to each result.
    const responseRows = List(
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
                id: rowID,
                blockNumber,
                blockData,
            };
        }),
    ).sortBy((item) => item.blockNumber);

    // Calculate period volume by subtracting total volume between each
    // consecutive segment.
    const graphPeriods = Array.from(new Array(segmentCount)).map(
        (_, i): PeriodData => {
            // tslint:disable-next-line: no-non-null-assertion
            const start = responseRows.get(i)!;
            // tslint:disable-next-line: no-non-null-assertion
            const end = responseRows.get(i + 1)!;

            const isFirstRow = periodType === PeriodType.ALL && i === 0;

            return {
                id: end.id, // "HOUR441028";
                type: "HOUR", // "HOUR";
                date:
                    activeTimestamp -
                    (activeBlock - end.blockNumber) * blockTime, // 1587700800;

                // total

                totalTxCountBTC: end.blockData
                    ? end.blockData.totalTxCountBTC
                    : "0",
                totalLockedBTC: end.blockData
                    ? end.blockData.totalLockedBTC
                    : "0",
                totalVolumeBTC: end.blockData
                    ? end.blockData.totalVolumeBTC
                    : "0",

                totalTxCountZEC: end.blockData
                    ? end.blockData.totalTxCountZEC
                    : "0",
                totalLockedZEC: end.blockData
                    ? end.blockData.totalLockedZEC
                    : "0",
                totalVolumeZEC: end.blockData
                    ? end.blockData.totalVolumeZEC
                    : "0",

                totalTxCountBCH: end.blockData
                    ? end.blockData.totalTxCountBCH
                    : "0",
                totalLockedBCH: end.blockData
                    ? end.blockData.totalLockedBCH
                    : "0",
                totalVolumeBCH: end.blockData
                    ? end.blockData.totalVolumeBCH
                    : "0",

                // period

                periodTxCountBTC: new BigNumber(
                    end.blockData ? end.blockData.totalTxCountBTC : "0",
                )
                    .minus(
                        start.blockData && !isFirstRow
                            ? start.blockData.totalTxCountBTC
                            : "0",
                    )
                    .toFixed(),
                periodLockedBTC: new BigNumber(
                    end.blockData ? end.blockData.totalLockedBTC : "0",
                )
                    .minus(
                        start.blockData && !isFirstRow
                            ? start.blockData.totalLockedBTC
                            : "0",
                    )
                    .toFixed(),
                periodVolumeBTC: new BigNumber(
                    end.blockData ? end.blockData.totalVolumeBTC : "0",
                )
                    .minus(
                        start.blockData && !isFirstRow
                            ? start.blockData.totalVolumeBTC
                            : "0",
                    )
                    .toFixed(),

                periodTxCountZEC: new BigNumber(
                    end.blockData ? end.blockData.totalTxCountZEC : "0",
                )
                    .minus(
                        start.blockData && !isFirstRow
                            ? start.blockData.totalTxCountZEC
                            : "0",
                    )
                    .toFixed(),
                periodLockedZEC: new BigNumber(
                    end.blockData ? end.blockData.totalLockedZEC : "0",
                )
                    .minus(
                        start.blockData && !isFirstRow
                            ? start.blockData.totalLockedZEC
                            : "0",
                    )
                    .toFixed(),
                periodVolumeZEC: new BigNumber(
                    end.blockData ? end.blockData.totalVolumeZEC : "0",
                )
                    .minus(
                        start.blockData && !isFirstRow
                            ? start.blockData.totalVolumeZEC
                            : "0",
                    )
                    .toFixed(),

                periodTxCountBCH: new BigNumber(
                    end.blockData ? end.blockData.totalTxCountBCH : "0",
                )
                    .minus(
                        start.blockData && !isFirstRow
                            ? start.blockData.totalTxCountBCH
                            : "0",
                    )
                    .toFixed(),
                periodLockedBCH: new BigNumber(
                    end.blockData ? end.blockData.totalLockedBCH : "0",
                )
                    .minus(
                        start.blockData && !isFirstRow
                            ? start.blockData.totalLockedBCH
                            : "0",
                    )
                    .toFixed(),
                periodVolumeBCH: new BigNumber(
                    end.blockData ? end.blockData.totalVolumeBCH : "0",
                )
                    .minus(
                        start.blockData && !isFirstRow
                            ? start.blockData.totalVolumeBCH
                            : "0",
                    )
                    .toFixed(),

                __typename: "PeriodData",
            };
        },
    );

    // Add up volumes and locked values for the entire period.
    const average = graphPeriods
        .slice(0, graphPeriods.length - 1)
        .reduce((sum, period) => {
            return {
                ...sum,
                date: Math.max(sum.date, period.date),
                periodTxCountBTC: new BigNumber(sum.periodTxCountBTC)
                    .plus(period.periodTxCountBTC)
                    .toFixed(0),
                periodVolumeBTC: new BigNumber(sum.periodVolumeBTC)
                    .plus(period.periodVolumeBTC)
                    .toFixed(0),
                periodLockedBTC: new BigNumber(sum.periodLockedBTC)
                    .plus(period.periodLockedBTC)
                    .toFixed(0),

                periodTxCountZEC: new BigNumber(sum.periodTxCountZEC)
                    .plus(period.periodTxCountZEC)
                    .toFixed(0),
                periodVolumeZEC: new BigNumber(sum.periodVolumeZEC)
                    .plus(period.periodVolumeZEC)
                    .toFixed(0),
                periodLockedZEC: new BigNumber(sum.periodLockedZEC)
                    .plus(period.periodLockedZEC)
                    .toFixed(0),

                periodTxCountBCH: new BigNumber(sum.periodTxCountBCH)
                    .plus(period.periodTxCountBCH)
                    .toFixed(0),
                periodVolumeBCH: new BigNumber(sum.periodVolumeBCH)
                    .plus(period.periodVolumeBCH)
                    .toFixed(0),
                periodLockedBCH: new BigNumber(sum.periodLockedBCH)
                    .plus(period.periodLockedBCH)
                    .toFixed(0),
            };
        }, graphPeriods[graphPeriods.length - 1]);

    return {
        historic: graphPeriods,
        average,
    };
};

interface QuotePeriodData extends PeriodData {
    // Total
    quoteTotalLocked: string;
    quoteTotalVolume: string;

    quoteTotalLockedBTC: number;
    quoteTotalVolumeBTC: number;
    quoteTotalLockedZEC: number;
    quoteTotalVolumeZEC: number;
    quoteTotalLockedBCH: number;
    quoteTotalVolumeBCH: number;

    // period
    quotePeriodLocked: string;
    quotePeriodVolume: string;

    quotePeriodLockedBTC: number;
    quotePeriodVolumeBTC: number;
    quotePeriodLockedZEC: number;
    quotePeriodVolumeZEC: number;
    quotePeriodLockedBCH: number;
    quotePeriodVolumeBCH: number;
}

export interface QuotePeriodResponse {
    historic: QuotePeriodData[];
    average: QuotePeriodData;
}

const normalizeValue = (
    amount: string | BigNumber,
    digits: number,
): BigNumber => {
    return new BigNumber(amount).div(new BigNumber(10).exponentiatedBy(digits));
};

const normalizeVolumes = (
    periodData: PeriodData,
    tokenPrices: TokenPrices,
    quoteCurrency: Currency,
): QuotePeriodData => {
    const data = {
        ...periodData,
        // total
        quoteTotalLockedBTC: normalizeValue(periodData.totalLockedBTC, 8)
            .times(
                tokenPrices
                    .get(Token.BTC, Map<Currency, number>())
                    .get(quoteCurrency) || 0,
            )
            .decimalPlaces(2)
            .toNumber(),
        quoteTotalVolumeBTC: normalizeValue(periodData.totalVolumeBTC, 8)
            .times(
                tokenPrices
                    .get(Token.BTC, Map<Currency, number>())
                    .get(quoteCurrency) || 0,
            )
            .decimalPlaces(2)
            .toNumber(),
        quoteTotalLockedZEC: normalizeValue(periodData.totalLockedZEC, 8)
            .times(
                tokenPrices
                    .get(Token.ZEC, Map<Currency, number>())
                    .get(quoteCurrency) || 0,
            )
            .decimalPlaces(2)
            .toNumber(),
        quoteTotalVolumeZEC: normalizeValue(periodData.totalVolumeZEC, 8)
            .times(
                tokenPrices
                    .get(Token.ZEC, Map<Currency, number>())
                    .get(quoteCurrency) || 0,
            )
            .decimalPlaces(2)
            .toNumber(),
        quoteTotalLockedBCH: normalizeValue(periodData.totalLockedBCH, 8)
            .times(
                tokenPrices
                    .get(Token.BCH, Map<Currency, number>())
                    .get(quoteCurrency) || 0,
            )
            .decimalPlaces(2)
            .toNumber(),
        quoteTotalVolumeBCH: normalizeValue(periodData.totalVolumeBCH, 8)
            .times(
                tokenPrices
                    .get(Token.BCH, Map<Currency, number>())
                    .get(quoteCurrency) || 0,
            )
            .decimalPlaces(2)
            .toNumber(),
        // period
        quotePeriodLockedBTC: normalizeValue(periodData.periodLockedBTC, 8)
            .times(
                tokenPrices
                    .get(Token.BTC, Map<Currency, number>())
                    .get(quoteCurrency) || 0,
            )
            .decimalPlaces(2)
            .toNumber(),
        quotePeriodVolumeBTC: normalizeValue(periodData.periodVolumeBTC, 8)
            .times(
                tokenPrices
                    .get(Token.BTC, Map<Currency, number>())
                    .get(quoteCurrency) || 0,
            )
            .decimalPlaces(2)
            .toNumber(),
        quotePeriodLockedZEC: normalizeValue(periodData.periodLockedZEC, 8)
            .times(
                tokenPrices
                    .get(Token.ZEC, Map<Currency, number>())
                    .get(quoteCurrency) || 0,
            )
            .decimalPlaces(2)
            .toNumber(),
        quotePeriodVolumeZEC: normalizeValue(periodData.periodVolumeZEC, 8)
            .times(
                tokenPrices
                    .get(Token.ZEC, Map<Currency, number>())
                    .get(quoteCurrency) || 0,
            )
            .decimalPlaces(2)
            .toNumber(),
        quotePeriodLockedBCH: normalizeValue(periodData.periodLockedBCH, 8)
            .times(
                tokenPrices
                    .get(Token.BCH, Map<Currency, number>())
                    .get(quoteCurrency) || 0,
            )
            .decimalPlaces(2)
            .toNumber(),
        quotePeriodVolumeBCH: normalizeValue(periodData.periodVolumeBCH, 8)
            .times(
                tokenPrices
                    .get(Token.BCH, Map<Currency, number>())
                    .get(quoteCurrency) || 0,
            )
            .decimalPlaces(2)
            .toNumber(),
    };

    return {
        ...data,
        // total
        quoteTotalLocked: new BigNumber(data.quoteTotalLockedBTC)
            .plus(data.quoteTotalLockedZEC)
            .plus(data.quoteTotalLockedBCH)
            .toFixed(2),
        quoteTotalVolume: new BigNumber(data.quoteTotalVolumeBTC)
            .plus(data.quoteTotalVolumeZEC)
            .plus(data.quoteTotalVolumeBCH)
            .toFixed(2),
        // period
        quotePeriodLocked: new BigNumber(data.quotePeriodLockedBTC)
            .plus(data.quotePeriodLockedZEC)
            .plus(data.quotePeriodLockedBCH)
            .toFixed(2),
        quotePeriodVolume: new BigNumber(data.quotePeriodVolumeBTC)
            .plus(data.quotePeriodVolumeZEC)
            .plus(data.quotePeriodVolumeBCH)
            .toFixed(2),
    };
};

export const normalizeSeriesVolumes = (
    periodResponse: PeriodResponse,
    tokenPrices: TokenPrices,
    quoteCurrency: Currency,
) => {
    return {
        ...periodResponse,
        historic: periodResponse.historic.map((item) =>
            normalizeVolumes(item, tokenPrices, quoteCurrency),
        ),
        average: normalizeVolumes(
            periodResponse.average,
            tokenPrices,
            quoteCurrency,
        ),
    };
};
