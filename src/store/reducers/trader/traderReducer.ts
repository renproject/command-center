import { ActionType, getType } from "typesafe-actions";

import * as accountActions from "../../actions/trader/accountActions";

import { TraderData } from "../../types";

type AccountAction = ActionType<typeof accountActions>;

export function traderReducer(state: TraderData = new TraderData(), action: AccountAction): TraderData {
    switch (action.type) {
        case getType(accountActions.storeAddress):
            return state.set("address", action.payload);

        case getType(accountActions.storeWeb3BrowserName):
            return state.set("web3BrowserName", action.payload);

        default:
            return state;
    }
}