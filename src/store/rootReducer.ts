import { Action, combineReducers } from "redux";
import { ThunkDispatch } from "redux-thunk";

import { ApplicationState } from "./applicationState";
import { networkReducer } from "./network/networkReducer";

export const rootReducer = combineReducers<ApplicationState>({
    network: networkReducer,
});

interface AppAction extends Action {
}
export type AppDispatch = ThunkDispatch<ApplicationState, null, AppAction>;
