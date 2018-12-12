import RenExSDK from "@renex/renex";
import BigNumber from "bignumber.js";

import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { getPrices } from "@Components/statuspage/lib/tokens";
import { getDarknodeCount, getOrderCount } from "@Library/statistics/network";
import { TokenPrices } from "@Reducers/types";

interface StoreTokenPricesPayload { tokenPrices: TokenPrices; }
export type StoreTokenPricesAction = (payload: StoreTokenPricesPayload) => void;
export const storeTokenPrices = createStandardAction("STORE_TOKEN_PRICES")<StoreTokenPricesPayload>();

interface StoreDarknodeCountPayload { darknodeCount: BigNumber; }
export type StoreDarknodeCountAction = (payload: StoreDarknodeCountPayload) => void;
export const storeDarknodeCount = createStandardAction("STORE_DARKNODE_COUNT")<StoreDarknodeCountPayload>();

interface StoreOrderCountPayload { orderCount: BigNumber; }
export type StoreOrderCountAction = (payload: StoreOrderCountPayload) => void;
export const storeOrderCount = createStandardAction("STORE_ORDER_COUNT")<StoreOrderCountPayload>();

export type UpdateNetworkStatisticsAction = (sdk: RenExSDK) => (dispatch: Dispatch) => Promise<void>;
export const updateNetworkStatistics: UpdateNetworkStatisticsAction = (sdk) => async (dispatch) => {
    const darknodeCount = await getDarknodeCount(sdk);
    dispatch(storeDarknodeCount({ darknodeCount }));

    const orderCount = await getOrderCount(sdk);
    dispatch(storeOrderCount({ orderCount }));
};

export type UpdateTokenPricesAction = () => (dispatch: Dispatch) => Promise<void>;
export const updateTokenPrices: UpdateTokenPricesAction = () => async (dispatch) => {
    const tokenPrices = await getPrices();
    dispatch(storeTokenPrices({ tokenPrices }));
};

