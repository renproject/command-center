import { ActionType, getType } from "typesafe-actions";

import * as networkActions from "@Actions/statistics/networkActions";
import * as operatorActions from "@Actions/statistics/operatorActions";

import { DarknodeDetails, StatisticsData } from "@Reducers/types";
import { OrderedMap } from "immutable";

type NetworkAction = ActionType<typeof networkActions>;
type OperatorActions = ActionType<typeof operatorActions>;

export default function statisticsReducer(state: StatisticsData = new StatisticsData(), action: NetworkAction | OperatorActions) {
    switch (action.type) {
        case getType(networkActions.storeDarknodeCount):
            return state.set("darknodeCount", action.payload.darknodeCount);

        case getType(networkActions.storeOrderCount):
            return state.set("orderCount", action.payload.orderCount);

        case getType(operatorActions.storeDarknodeList):
            let darknodeDetails = state.darknodeDetails || OrderedMap<string, DarknodeDetails | null>();
            for (const darknodeID of action.payload.darknodeList.toArray()) {
                darknodeDetails = darknodeDetails.set(darknodeID, darknodeDetails.get(darknodeID) || null);
            }

            return state.set("darknodeDetails", darknodeDetails);

        default:
            return state;
    }
}
