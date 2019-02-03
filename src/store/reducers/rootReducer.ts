import { combineReducers } from "redux";

import { popupReducer } from "./popup/popupReducer";
import { statisticsReducer } from "./statistics/statisticsReducer";
import { traderReducer } from "./trader/traderReducer";
import { uiReducer } from "./ui/uiReducer";

import { ApplicationData } from "../types";

export const rootReducer = combineReducers<ApplicationData>({
    popup: popupReducer,
    trader: traderReducer,
    statistics: statisticsReducer,
    ui: uiReducer,
});
