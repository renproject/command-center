import RenExSDK from "@renex/renex";

import { List } from "immutable";
import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { getOperatorDarknodes } from "@Library/statistics/operator";

interface StoreDarknodeListPayload { darknodeList: List<string>; }
export type StoreDarknodeListAction = (payload: StoreDarknodeListPayload) => void;
export const storeDarknodeList = createStandardAction("STORE_DARKNODE_LIST")<StoreDarknodeListPayload>();

export type ClearDarknodeListAction = () => void;
export const clearDarknodeList = createStandardAction("CLEAR_DARKNODE_LIST")();

interface StoreSelectedDarknodePayload { selectedDarknode: string; }
export type StoreSelectedDarknodeAction = (payload: StoreSelectedDarknodePayload) => void;
export const storeSelectedDarknode = createStandardAction("STORE_SELECTED_DARKNODE")<StoreSelectedDarknodePayload>();

export type UpdateOperatorStatisticsAction = (sdk: RenExSDK) => (dispatch: Dispatch) => Promise<void>;
export const updateOperatorStatistics: UpdateOperatorStatisticsAction = (sdk) => async (dispatch) => {
    const darknodeList = await getOperatorDarknodes(sdk);
    dispatch(storeDarknodeList({ darknodeList }));
    dispatch(storeSelectedDarknode({ selectedDarknode: darknodeList.first() }));
};
