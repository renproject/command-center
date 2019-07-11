import { ActionType, getType } from "typesafe-actions";

import * as accountActions from "../../actions/trader/accountActions";
import { TraderData } from "../../types";

type AccountAction = ActionType<typeof accountActions>;

export const traderReducer = (state: TraderData = new TraderData(), action: AccountAction): TraderData => {
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
