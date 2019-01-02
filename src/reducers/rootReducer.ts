import { combineReducers } from "redux";

import { alertReducer } from "../reducers/alert/alertReducer";
import { popupReducer } from "../reducers/popup/popupReducer";
import { statisticsReducer } from "../reducers/statistics/statisticsReducer";
import { traderReducer } from "../reducers/trader/traderReducer";

import { ApplicationData } from "../reducers/types";

export const rootReducer = combineReducers<ApplicationData>({
    alert: alertReducer,
    popup: popupReducer,
    trader: traderReducer,
    statistics: statisticsReducer,
});
