import RenExSDK from "renex-sdk-ts";

import { List } from "immutable";
import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { getOperatorDarknodes } from "@Library/statistics/operator";

interface StoreDarknodeListPayload { darknodeList: List<string>; }
export type StoreDarknodeListAction = (payload: StoreDarknodeListPayload) => void;
export const storeDarknodeList = createStandardAction("STORE_DARKNODE_LIST")<StoreDarknodeListPayload>();

export type UpdateOperatorStatisticsAction = (sdk: RenExSDK) => (dispatch: Dispatch) => Promise<void>;
export const updateOperatorStatistics: UpdateOperatorStatisticsAction = (sdk) => async (dispatch) => {
    const darknodeList = await getOperatorDarknodes(sdk);
    dispatch(storeDarknodeList({ darknodeList }));
};
