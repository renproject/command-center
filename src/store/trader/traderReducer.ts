import { ActionType, getType } from "typesafe-actions";

import { TraderState } from "../applicationState";
import * as accountActions from "./accountActions";

type AccountAction = ActionType<typeof accountActions>;

export const traderReducer = (state: TraderState = new TraderState(), action: AccountAction): TraderState => {
    switch (action.type) {
        case getType(accountActions.storeAddress):
            return state.set("address", action.payload);

        case getType(accountActions.storeWeb3):
            return state.set("web3", action.payload);

        case getType(accountActions.storeWeb3BrowserName):
            return state.set("web3BrowserName", action.payload);

        case getType(accountActions.storeRenNetwork):
            return state.set("renNetwork", action.payload);

        default:
            return state;
    }
};
