import { ActionType, getType } from "typesafe-actions";

import * as networkActions from "@Actions/statistics/network";

import { StatisticsData } from "@Reducers/types";

type NetworkAction = ActionType<typeof networkActions>;

export default function statisticsReducer(state: StatisticsData = new StatisticsData(), action: NetworkAction) {
    switch (action.type) {
        case getType(networkActions.storeDarknodeCount):
            return state.set("darknodeCount", action.payload.darknodeCount);

        case getType(networkActions.storeOrderCount):
            return state.set("orderCount", action.payload.orderCount);

        default:
            return state;
    }
}
