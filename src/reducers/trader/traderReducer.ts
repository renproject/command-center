import { ActionType, getType } from "typesafe-actions";

import * as accountActions from "@Actions/trader/accountActions";
import * as walletActions from "@Actions/trader/walletActions";

import { TraderData } from "@Reducers/types";

type AccountAction = ActionType<typeof accountActions>;
type WalletAction = ActionType<typeof walletActions>;

export function traderReducer(state: TraderData = new TraderData(), action: AccountAction | WalletAction) {
    switch (action.type) {
        case getType(accountActions.storeAddress):
            return state.set("address", action.payload);

        // Wallet
        case getType(walletActions.storeWallet):
            return state.set("wallet", action.payload.wallet);

        case getType(accountActions.storeSDK):
            console.assert(action.payload.sdk !== undefined);
            return state.set("sdk", action.payload.sdk);

        default:
            return state;
    }
}
