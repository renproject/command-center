import { ActionType, getType } from "typesafe-actions";

import * as networkActions from "@Actions/statistics/networkActions";
import * as operatorActions from "@Actions/statistics/operatorActions";

import { DarknodeDetails, StatisticsData } from "@Reducers/types";
import { OrderedMap } from "immutable";

type NetworkAction = ActionType<typeof networkActions>;
type OperatorActions = ActionType<typeof operatorActions>;

export function statisticsReducer(state: StatisticsData = new StatisticsData(), action: NetworkAction | OperatorActions) {
    switch (action.type) {
        case getType(networkActions.storeDarknodeCount):
            return state.set("darknodeCount", action.payload.darknodeCount);

        case getType(networkActions.storeOrderCount):
            return state.set("orderCount", action.payload.orderCount);

        case getType(operatorActions.storeDarknodeList):
            return state.set("darknodeList", action.payload.darknodeList);

        case getType(operatorActions.storeSelectedDarknode):
            return state.set("selectedDarknode", action.payload.selectedDarknode);

        case getType(operatorActions.setDarknodeDetails):
            const details = action.payload.darknodeDetails;
            return state.set("darknodeDetails", state.darknodeDetails.set(details.ID, details));

        case getType(operatorActions.clearDarknodeList):
            return state
                .set("darknodeDetails", OrderedMap<string, DarknodeDetails>())
                .set("selectedDarknode", null)
                ;

        default:
            return state;
    }
}
