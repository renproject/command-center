import { Currency } from "@renproject/react-components";
import { ApolloClient } from "apollo-boost";
import BigNumber from "bignumber.js";
import { List, Map } from "immutable";

import { Token, TokenPrices } from "../ethereum/tokens";
import { PeriodData, QUERY_PERIOD_HISTORY } from "./queries";

export enum PeriodType {
    HOUR = "HOUR",
    DAY = "DAY",
    WEEK = "WEEK",
    MONTH = "MONTH",
    YEAR = "YEAR",
    ALL = "ALL",
}

export const getPeriodTimespan = (type: string): number => {
    switch (type) {
        case PeriodType.HOUR:
            return 60 * 60;
        case PeriodType.DAY:
            return 60 * 60 * 24;
        case PeriodType.WEEK:
            return 60 * 60 * 24 * 7;
        case PeriodType.MONTH:
            return 60 * 60 * 24 * 31;
        case PeriodType.YEAR:
            return 60 * 60 * 24 * 365;
        default:
            throw new Error(`Unknown period type ${type}`);
    }
};

export const getSubperiodCount = (type: string): { graph: number, amount: number, type: PeriodType } => {
    switch (type) {
        case PeriodType.HOUR:
            return { graph: 7, amount: 1, type: PeriodType.HOUR };
        case PeriodType.DAY:
            return { graph: 12, amount: 24, type: PeriodType.HOUR };
        case PeriodType.WEEK:
            return { graph: 7, amount: 7, type: PeriodType.DAY };
        case PeriodType.MONTH:
            return { graph: 12, amount: 31, type: PeriodType.DAY };
        case PeriodType.YEAR:
            return { graph: 12, amount: 12, type: PeriodType.MONTH };
        case PeriodType.ALL:
            return { graph: 8, amount: 8, type: PeriodType.WEEK }; // TODO: Fix `31` value
        default:
            throw new Error(`Unknown period type ${type}`);
    }
};

export interface PeriodResponse {
    historic: PeriodData[];
    average: PeriodData;
}

export type PeriodResponses = Map<PeriodType, PeriodResponse>;

export const getVolumes = async (client: ApolloClient<unknown>, periodType: PeriodType): Promise<PeriodResponse> => {

    const subperiod = getSubperiodCount(periodType);
    const response = await client
        .query<{ periodDatas: PeriodData[] }>({
            query: QUERY_PERIOD_HISTORY,
            variables: {
                type: subperiod.type,
                // amount: ,
            }
        });

    const periodDatas = List(response.data.periodDatas);

    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    const periodTimespan = getPeriodTimespan(subperiod.type);
    const adjustedTimestamp = Math.floor(currentTimestamp / periodTimespan) * periodTimespan;

    const periods = Array.from(Array(subperiod.amount)).map((_, i) => adjustedTimestamp - periodTimespan * i);

    const historic = periods.map((periodDate) => {
        const exactMatch = periodDatas.filter((periodData) => periodData.date === periodDate).first<PeriodData>();
        if (exactMatch) {
            return exactMatch;
        }

        // tslint:disable-next-line: no-non-null-assertion
        const inexact = periodDatas.filter((periodData) => periodData.date <= periodDate).first<PeriodData>() || {};

        return {
            id: `${periodType}${periodDate / periodTimespan}`,
            type: subperiod.type,
            date: periodDate,
            // total

            __typename: "PeriodData",

            totalTxCountBTC: inexact.totalTxCountBTC || "0",
            totalLockedBTC: inexact.totalLockedBTC || "0",
            totalVolumeBTC: inexact.totalVolumeBTC || "0",

            totalTxCountZEC: inexact.totalTxCountZEC || "0",
            totalLockedZEC: inexact.totalLockedZEC || "0",
            totalVolumeZEC: inexact.totalVolumeZEC || "0",

            totalTxCountBCH: inexact.totalTxCountBCH || "0",
            totalLockedBCH: inexact.totalLockedBCH || "0",
            totalVolumeBCH: inexact.totalVolumeBCH || "0",

            // period

            periodTxCountBTC: "0",
            periodLockedBTC: "0",
            periodVolumeBTC: "0",

            periodTxCountZEC: "0",
            periodLockedZEC: "0",
            periodVolumeZEC: "0",

            periodTxCountBCH: "0",
            periodLockedBCH: "0",
            periodVolumeBCH: "0",

        };
    })
        .reverse()
        .map(item => ({
            ...item,
            date: Math.min(item.date + periodTimespan, currentTimestamp),
        }));

    const averagePeriods = historic.slice(historic.length - subperiod.amount);

    const graphPeriods = historic.slice(historic.length - subperiod.graph);

    const average = averagePeriods.slice(0, averagePeriods.length - 1).reduce((sum, period) => {
        return {
            ...sum,
            date: Math.max(sum.date, period.date),
            periodTxCountBTC: new BigNumber(sum.periodTxCountBTC).plus(period.periodTxCountBTC).toFixed(0),
            periodVolumeBTC: new BigNumber(sum.periodVolumeBTC).plus(period.periodVolumeBTC).toFixed(0),
            periodLockedBTC: new BigNumber(sum.periodLockedBTC).plus(period.periodLockedBTC).toFixed(0),

            periodTxCountZEC: new BigNumber(sum.periodTxCountZEC).plus(period.periodTxCountZEC).toFixed(0),
            periodVolumeZEC: new BigNumber(sum.periodVolumeZEC).plus(period.periodVolumeZEC).toFixed(0),
            periodLockedZEC: new BigNumber(sum.periodLockedZEC).plus(period.periodLockedZEC).toFixed(0),

            periodTxCountBCH: new BigNumber(sum.periodTxCountBCH).plus(period.periodTxCountBCH).toFixed(0),
            periodVolumeBCH: new BigNumber(sum.periodVolumeBCH).plus(period.periodVolumeBCH).toFixed(0),
            periodLockedBCH: new BigNumber(sum.periodLockedBCH).plus(period.periodLockedBCH).toFixed(0),
        };
    }, averagePeriods[averagePeriods.length - 1]);

    return {
        historic: graphPeriods,
        average,
    };
};

export interface QuotePeriodData extends PeriodData {
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

const normalizeValue = (amount: string, digits: number): BigNumber => {
    return new BigNumber(amount).div(new BigNumber(10).exponentiatedBy(digits));
};

export const normalizeVolumes = (periodData: PeriodData, tokenPrices: TokenPrices, quoteCurrency: Currency): QuotePeriodData => {

    const data = {
        ...periodData,
        // total
        quoteTotalLockedBTC: normalizeValue(periodData.totalLockedBTC, 8).times(tokenPrices.get(Token.BTC, Map<Currency, number>()).get(quoteCurrency) || 0).decimalPlaces(2).toNumber(),
        quoteTotalVolumeBTC: normalizeValue(periodData.totalVolumeBTC, 8).times(tokenPrices.get(Token.BTC, Map<Currency, number>()).get(quoteCurrency) || 0).decimalPlaces(2).toNumber(),
        quoteTotalLockedZEC: normalizeValue(periodData.totalLockedZEC, 8).times(tokenPrices.get(Token.ZEC, Map<Currency, number>()).get(quoteCurrency) || 0).decimalPlaces(2).toNumber(),
        quoteTotalVolumeZEC: normalizeValue(periodData.totalVolumeZEC, 8).times(tokenPrices.get(Token.ZEC, Map<Currency, number>()).get(quoteCurrency) || 0).decimalPlaces(2).toNumber(),
        quoteTotalLockedBCH: normalizeValue(periodData.totalLockedBCH, 8).times(tokenPrices.get(Token.BCH, Map<Currency, number>()).get(quoteCurrency) || 0).decimalPlaces(2).toNumber(),
        quoteTotalVolumeBCH: normalizeValue(periodData.totalVolumeBCH, 8).times(tokenPrices.get(Token.BCH, Map<Currency, number>()).get(quoteCurrency) || 0).decimalPlaces(2).toNumber(),
        // period
        quotePeriodLockedBTC: normalizeValue(periodData.periodLockedBTC, 8).times(tokenPrices.get(Token.BTC, Map<Currency, number>()).get(quoteCurrency) || 0).decimalPlaces(2).toNumber(),
        quotePeriodVolumeBTC: normalizeValue(periodData.periodVolumeBTC, 8).times(tokenPrices.get(Token.BTC, Map<Currency, number>()).get(quoteCurrency) || 0).decimalPlaces(2).toNumber(),
        quotePeriodLockedZEC: normalizeValue(periodData.periodLockedZEC, 8).times(tokenPrices.get(Token.ZEC, Map<Currency, number>()).get(quoteCurrency) || 0).decimalPlaces(2).toNumber(),
        quotePeriodVolumeZEC: normalizeValue(periodData.periodVolumeZEC, 8).times(tokenPrices.get(Token.ZEC, Map<Currency, number>()).get(quoteCurrency) || 0).decimalPlaces(2).toNumber(),
        quotePeriodLockedBCH: normalizeValue(periodData.periodLockedBCH, 8).times(tokenPrices.get(Token.BCH, Map<Currency, number>()).get(quoteCurrency) || 0).decimalPlaces(2).toNumber(),
        quotePeriodVolumeBCH: normalizeValue(periodData.periodVolumeBCH, 8).times(tokenPrices.get(Token.BCH, Map<Currency, number>()).get(quoteCurrency) || 0).decimalPlaces(2).toNumber(),
        // tslint:enable: no-non-null-assertion
    };

    return {
        ...data,
        // total
        quoteTotalLocked: new BigNumber(data.quoteTotalLockedBTC).plus(data.quoteTotalLockedZEC).plus(data.quoteTotalLockedBCH).toFixed(2),
        quoteTotalVolume: new BigNumber(data.quoteTotalVolumeBTC).plus(data.quoteTotalVolumeZEC).plus(data.quoteTotalVolumeBCH).toFixed(2),
        // period
        quotePeriodLocked: new BigNumber(data.quotePeriodLockedBTC).plus(data.quotePeriodLockedZEC).plus(data.quotePeriodLockedBCH).toFixed(2),
        quotePeriodVolume: new BigNumber(data.quotePeriodVolumeBTC).plus(data.quotePeriodVolumeZEC).plus(data.quotePeriodVolumeBCH).toFixed(2),
    };
};

export const normalizeSeriesVolumes = (periodResponse: PeriodResponse, tokenPrices: TokenPrices, quoteCurrency: Currency) => {
    return {
        ...periodResponse,
        historic: periodResponse.historic.map(item => normalizeVolumes(item, tokenPrices, quoteCurrency)),
        average: normalizeVolumes(periodResponse.average, tokenPrices, quoteCurrency),
    };
};


export const getCurrent24HourPeriod = () => {
    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    const periodTimespan = getPeriodTimespan(PeriodType.DAY);
    return Math.floor(currentTimestamp / periodTimespan) * periodTimespan;
};
