import { Action, combineReducers } from "redux";
import { ThunkDispatch } from "redux-thunk";

import { accountReducer } from "./account/accountReducer";
import { ApplicationState } from "./applicationState";
import { networkReducer } from "./network/networkReducer";
// import { popupReducer } from "./popup/popupReducer";
import { uiReducer } from "./ui/uiReducer";

export const rootReducer = combineReducers<ApplicationState>({
    // popup: popupReducer,
    account: accountReducer,
    network: networkReducer,
    ui: uiReducer,
});

interface AppAction extends Action {
}
export type AppDispatch = ThunkDispatch<ApplicationState, null, AppAction>;
