import { combineReducers } from "redux";

import { alertReducer } from "@Reducers/alert/alertReducer";
import { popupReducer } from "@Reducers/popup/popupReducer";
import { statisticsReducer } from "@Reducers/statistics/statisticsReducer";
import { traderReducer } from "@Reducers/trader/traderReducer";

import { ApplicationData } from "@Reducers/types";

export const rootReducer = combineReducers<ApplicationData>({
    alert: alertReducer,
    popup: popupReducer,
    trader: traderReducer,
    statistics: statisticsReducer,
});
