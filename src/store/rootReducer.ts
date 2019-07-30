import { Action, combineReducers } from "redux";
import { ThunkDispatch } from "redux-thunk";

import { ApplicationState } from "./applicationState";
import { popupReducer } from "./popup/popupReducer";
import { statisticsReducer } from "./statistics/statisticsReducer";
import { traderReducer } from "./trader/traderReducer";
import { uiReducer } from "./ui/uiReducer";

export const rootReducer = combineReducers<ApplicationState>({
    popup: popupReducer,
    trader: traderReducer,
    statistics: statisticsReducer,
    ui: uiReducer,
});

interface AppAction extends Action {
}
export type AppDispatch = ThunkDispatch<ApplicationState, null, AppAction>;
