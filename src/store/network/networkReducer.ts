import { List } from "immutable";
import { ActionType, getType } from "typesafe-actions";

import { _captureInteractionException_ } from "../../lib/react/errors";
import { NetworkState } from "../applicationState";
import * as networkActions from "./networkActions";
import * as operatorActions from "./operatorActions";

type NetworkAction = ActionType<typeof networkActions>;
type OperatorActions = ActionType<typeof operatorActions>;

export const networkReducer = (
    state: NetworkState = new NetworkState(),
    action: NetworkAction | OperatorActions
): NetworkState => {
    switch (action.type) {
        case getType(networkActions.updateCurrentCycle):
            return state.set("currentCycle", action.payload);

        case getType(networkActions.updatePreviousCycle):
            return state.set("previousCycle", action.payload);

        case getType(networkActions.updatePendingRewards):
            return state.set("pendingRewards", action.payload);

        case getType(networkActions.updatePendingTotalInEth):
            return state.set("pendingTotalInEth", action.payload);

        case getType(networkActions.updatePendingRewardsInEth):
            return state.set("pendingRewardsInEth", action.payload);

        case getType(networkActions.updateCycleTimeout):
            return state.set("cycleTimeout", action.payload);

        case getType(networkActions.storeTokenPrices):
            return state.set("tokenPrices", action.payload);

        case getType(operatorActions.addRegisteringDarknode):
            return state.set("darknodeRegisteringList", state.darknodeRegisteringList.set(
                action.payload.darknodeID,
                action.payload.publicKey
            ));

        case getType(operatorActions.removeRegisteringDarknode):
            return state.set("darknodeRegisteringList", state.darknodeRegisteringList.remove(
                action.payload.darknodeID
            ));

        case getType(operatorActions.removeDarknode):
            try {
                let operatorList = state.darknodeList.getIn([action.payload.operator, action.payload.network], null) as List<string> | null;
                if (!operatorList) {
                    return state;
                }

                operatorList = operatorList.filter(id => id !== action.payload.darknodeID);

                return state.set("darknodeList", state.darknodeList.set(action.payload.operator, operatorList));
            } catch (error) {
                _captureInteractionException_(error, {
                    description: "Error throw in removeDarknode reducer",
                    shownToUser: "No",
                });
                return state;
            }

        case getType(operatorActions.addDarknode):
            let newList = state.darknodeList.getIn([action.payload.address, action.payload.network], List()) as List<string>;
            let newNames = state.darknodeNames;

            // Add to list if it's not already in there
            if (!newList.contains(action.payload.darknodeID)) {
                newList = newList.push(action.payload.darknodeID);
            }

            newList.map((darknodeID: string) => {
                if (!newNames.has(darknodeID)) {
                    newNames = newNames.set(darknodeID, `Darknode ${newList.indexOf(darknodeID) + 1}`);
                }
                return null;
            });

            const darknodeRegisteringList = state.darknodeRegisteringList
                .filter((_: string, darknodeID: string) => !newList.contains(darknodeID));

            return state
                .set("darknodeList", state.darknodeList.set(action.payload.address, newList))
                .set("darknodeNames", newNames)
                .set("darknodeRegisteringList", darknodeRegisteringList);

        case getType(operatorActions.setEmptyDarknodeList):
            return state
                .set("darknodeList", state.darknodeList.set(action.payload.address, List()));

        case getType(operatorActions.storeQuoteCurrency):
            return state.set("quoteCurrency", action.payload.quoteCurrency);

        case getType(operatorActions.updateDarknodeHistory):
            return state.set("balanceHistories", state.balanceHistories.set(
                action.payload.darknodeID,
                action.payload.balanceHistory,
            ));

        case getType(operatorActions.storeSecondsPerBlock):
            return state.set("secondsPerBlock", action.payload.secondsPerBlock);

        case getType(operatorActions.addToWithdrawAddresses):
            const foundList = state.withdrawAddresses.get(action.payload.token, List());
            if (foundList.contains(action.payload.address)) {
                return state;
            }
            return state.set(
                "withdrawAddresses",
                state.withdrawAddresses.set(
                    action.payload.token,
                    foundList.push(action.payload.address),
                ),
            );

        case getType(operatorActions.removeFromWithdrawAddresses):
            const list = state.withdrawAddresses.get(action.payload.token);
            if (!list) { return state; }
            const foundIndex = list.findIndex((address) => address === action.payload.address);
            if (foundIndex === -1) { return state; }
            return state.set(
                "withdrawAddresses",
                state.withdrawAddresses.set(
                    action.payload.token,
                    list.remove(foundIndex),
                ),
            );

        case getType(operatorActions.setDarknodeDetails):
            const details = action.payload.darknodeDetails;
            return state.set("darknodeDetails", state.darknodeDetails.set(
                details.ID,
                action.payload.darknodeDetails,
            ));

        case getType(operatorActions.storeRegistrySync):
            return state.set("registrySync", action.payload);

        case getType(operatorActions.addTransaction):
            return state.set("transactions", state.transactions.set(action.payload.txHash, action.payload.tx));

        case getType(operatorActions.setTxConfirmations):
            return state.set("confirmations", state.confirmations.set(action.payload.txHash, action.payload.confirmations));

        case getType(operatorActions.setDarknodeName):
            return state.set("darknodeNames", state.darknodeNames.set(action.payload.darknodeID, action.payload.name));

        default:
            return state;
    }
};
