import { ActionType, getType } from "typesafe-actions";

import * as networkActions from "@Actions/statistics/networkActions";
import * as operatorActions from "@Actions/statistics/operatorActions";

import { DarknodeDetails, StatisticsData } from "@Reducers/types";
import { OrderedMap } from "immutable";

type NetworkAction = ActionType<typeof networkActions>;
type OperatorActions = ActionType<typeof operatorActions>;

export function statisticsReducer(state: StatisticsData = new StatisticsData(), action: NetworkAction | OperatorActions) {
    switch (action.type) {
        case getType(networkActions.storeMinimumBond):
            return state.set("minimumBond", action.payload.minimumBond);

        case getType(networkActions.storeTokenPrices):
            return state.set("tokenPrices", action.payload.tokenPrices);

        case getType(operatorActions.storeDarknodeList):
            return state.set("darknodeList", action.payload.darknodeList);

        case getType(operatorActions.storeQuoteCurrency):
            return state.set("quoteCurrency", action.payload.quoteCurrency);

        case getType(operatorActions.setDarknodeDetails):
            const details = action.payload.darknodeDetails;
            return state.set("darknodeDetails", state.darknodeDetails.set(details.ID, details));

        case getType(operatorActions.clearDarknodeList):
            return state
                .set("darknodeList", null)
                .set("darknodeDetails", OrderedMap<string, DarknodeDetails>());

        default:
            return state;
    }
}
