import RenExSDK from "@renex/renex";
import BigNumber from "bignumber.js";

import { List, OrderedMap } from "immutable";
import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { getOperatorDarknodes } from "@Library/statistics/operator";
import { DarknodeDetails } from "@Reducers/types";

// Legacy
import contracts from "../../components/legacy/lib/contracts";
import { Token, TokenDetails, Tokens } from "../../components/legacy/lib/tokens";

interface StoreDarknodeListPayload { darknodeList: List<string>; }
export type StoreDarknodeListAction = (payload: StoreDarknodeListPayload) => void;
export const storeDarknodeList = createStandardAction("STORE_DARKNODE_LIST")<StoreDarknodeListPayload>();

export type ClearDarknodeListAction = () => void;
export const clearDarknodeList = createStandardAction("CLEAR_DARKNODE_LIST")();

interface StoreSelectedDarknodePayload { selectedDarknode: string; }
export type StoreSelectedDarknodeAction = (payload: StoreSelectedDarknodePayload) => void;
export const storeSelectedDarknode = createStandardAction("STORE_SELECTED_DARKNODE")<StoreSelectedDarknodePayload>();

interface SetDarknodeDetailsPayload { darknodeDetails: DarknodeDetails; }
export type SetDarknodeDetailsAction = (payload: SetDarknodeDetailsPayload) => void;
export const setDarknodeDetails = createStandardAction("UPDATE_DARKNODE_DETAILS")<SetDarknodeDetailsPayload>();

export type UpdateOperatorStatisticsAction = (sdk: RenExSDK) => (dispatch: Dispatch) => Promise<void>;
export const updateOperatorStatistics: UpdateOperatorStatisticsAction = (sdk) => async (dispatch) => {
    const darknodeList = await getOperatorDarknodes(sdk);
    dispatch(storeDarknodeList({ darknodeList }));
    dispatch(storeSelectedDarknode({ selectedDarknode: darknodeList.first() }));
};

interface BalanceItem {
    token: Token;
    balance: string;
}

const getBalances = async (sdk: RenExSDK, darknodeID: string): Promise<OrderedMap<Token, string>> => {

    const contract = new (sdk.getWeb3().eth.Contract)(contracts.DarknodeRewardVault.ABI, contracts.DarknodeRewardVault.address);

    let feesEarned = OrderedMap<Token, string>();

    const balances = Tokens.map(async (token: Token) => {
        // tslint:disable-next-line:no-non-null-assertion
        const tokenDetails = TokenDetails.get(token)!;
        const balance = await contract.methods.darknodeBalances(darknodeID, tokenDetails.address).call();
        return {
            balance,
            token,
        };
    });
    const res = await Promise.all(balances);

    for (const { balance, token } of res) {
        feesEarned = feesEarned.set(token, balance);
    }

    return feesEarned;
};

const getDarknodeStatus = async (sdk: RenExSDK, darknodeID: string): Promise<string> => {

    return new Promise<string>((resolve) => {
        Promise.all([
            sdk._contracts.darknodeRegistry.isPendingRegistration(darknodeID, {}),
            sdk._contracts.darknodeRegistry.isPendingDeregistration(darknodeID, {}),
            sdk._contracts.darknodeRegistry.isDeregisterable(darknodeID, {}),
            sdk._contracts.darknodeRegistry.isRefunded(darknodeID, {}),
            sdk._contracts.darknodeRegistry.isRefundable(darknodeID, {}),
            sdk._contracts.darknodeRegistry.isRegistered(darknodeID, {}),
        ]).then((response) => {
            const res = {
                isPendingRegistration: response[0],
                isPendingDeregistration: response[1],
                isDeregisterable: response[2],
                isRefunded: response[3],
                isRefundable: response[4],
                isRegistered: response[5],
            };
            let registrationStatus = "";
            if (res.isRefunded) {
                registrationStatus = "unregistered";
            } else if (res.isPendingRegistration) {
                registrationStatus = "registrationPending";
            } else if (res.isDeregisterable) {
                registrationStatus = "registered";
            } else if (res.isPendingDeregistration) {
                registrationStatus = "deregistrationPending";
            } else if (res.isRefundable) {
                registrationStatus = "awaitingRefund";
            }
            resolve(registrationStatus);
        })
            .catch(console.error);
    });
};

export type UpdateDarknodeStatisticsAction = (sdk: RenExSDK, darknodeID: string) => (dispatch: Dispatch) => Promise<void>;
export const updateDarknodeStatistics: UpdateDarknodeStatisticsAction = (sdk, darknodeID) => async (dispatch) => {
    // Get eth Balance
    const ethBalanceBN = await sdk.getWeb3().eth.getBalance(darknodeID);
    const ethBalance = new BigNumber(ethBalanceBN.toString());

    // Get earned fees
    const feesEarned = await getBalances(sdk, darknodeID);

    // Get registration status
    const registrationStatus = await getDarknodeStatus(sdk, darknodeID);

    const darknodeDetails = new DarknodeDetails({
        ID: darknodeID,
        multiAddress: "" as string,
        publicKey: "" as string,
        ethBalance,
        feesEarned,

        averageGasUsage: 0,
        lastTopUp: null,
        expectedExhaustion: null,

        peers: 0,
        registrationStatus,
    });

    dispatch(setDarknodeDetails({ darknodeDetails }));
};
