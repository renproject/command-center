import { ActionType, getType } from "typesafe-actions";

import { getWeb3BrowserName } from "../../lib/ethereum/browsers";
import { AccountState, readOnlyWeb3 } from "../applicationState";
import * as accountActions from "./accountActions";

type AccountAction = ActionType<typeof accountActions>;

export const accountReducer = (state: AccountState = new AccountState(), action: AccountAction): AccountState => {
    switch (action.type) {
        case getType(accountActions.logout):
            return state
                .set("web3", readOnlyWeb3)
                .set("address", null)
                .set("loggedOut", true)
                .set("loggedInBefore", false);

        case getType(accountActions.login):
            return state
                .set("address", action.payload.address)
                .set("web3", action.payload.web3)
                .set("loggedInBefore", true);

        case getType(accountActions.storeWeb3BrowserName):
            const web3BrowserName = getWeb3BrowserName(action.payload);
            return state.set("web3BrowserName", web3BrowserName);

        case getType(accountActions.storeRenNetwork):
            return state.set("renNetwork", action.payload);

        default:
            return state;
    }
};
