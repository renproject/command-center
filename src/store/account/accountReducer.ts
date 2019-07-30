import { ActionType, getType } from "typesafe-actions";

import { getWeb3BrowserName } from "../../lib/ethereum/browsers";
import { readOnlyWeb3 } from "../../lib/ethereum/wallet";
import { AccountState } from "../applicationState";
import * as accountActions from "./accountActions";

type AccountAction = ActionType<typeof accountActions>;

export const accountReducer = (state: AccountState = new AccountState(), action: AccountAction): AccountState => {
    switch (action.type) {
        case getType(accountActions.logout):
            return state
                .set("web3", readOnlyWeb3)
                .set("address", null);

        case getType(accountActions.storeAddress):
            return state.set("address", action.payload);

        case getType(accountActions.storeWeb3):
            return state.set("web3", action.payload);

        case getType(accountActions.storeWeb3BrowserName):
            const web3BrowserName = getWeb3BrowserName(action.payload);
            return state.set("web3BrowserName", web3BrowserName);

        case getType(accountActions.storeRenNetwork):
            return state.set("renNetwork", action.payload);

        default:
            return state;
    }
};
