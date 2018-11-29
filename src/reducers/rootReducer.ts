import { combineReducers } from "redux";

import alert from "@Reducers/alert/alertReducer";
import popup from "@Reducers/popup/popupReducer";
import statistics from "@Reducers/statistics/statisticsReducer";
import trader from "@Reducers/trader/traderReducer";

import { ApplicationData } from "@Reducers/types";

const rootReducer = combineReducers<ApplicationData>({
    alert,
    popup,
    trader,
    statistics,
});

export default rootReducer;
