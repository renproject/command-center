import RenExSDK from "renex-sdk-ts";

import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { getDarknodeCount, getOrderCount } from "@Library/statistics/network";
import BigNumber from "bignumber.js";

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
