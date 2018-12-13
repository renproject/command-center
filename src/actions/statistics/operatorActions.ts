import RenExSDK from "@renex/renex";
import BigNumber from "bignumber.js";

import { List, OrderedMap } from "immutable";
import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { getOperatorDarknodes } from "@Library/statistics/operator";
import { Currency, DarknodeDetails, TokenPrices } from "@Reducers/types";

// Legacy
import contracts from "../../components/statuspage/lib/contracts";
import { Token, TokenDetails, Tokens } from "../../components/statuspage/lib/tokens";

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
};

const getBalances = async (sdk: RenExSDK, darknodeID: string, tokenPrices: TokenPrices): Promise<OrderedMap<Token, BigNumber>> => {

    const contract = new (sdk.getWeb3().eth.Contract)(contracts.DarknodeRewardVault.ABI, contracts.DarknodeRewardVault.address);

    let feesEarned = OrderedMap<Token, BigNumber>();

    const balances = Tokens.map(async (token: Token) => {
        const tokenDetails = TokenDetails.get(token, undefined);
        if (!tokenDetails) {
            return {
                balance: new BigNumber(0),
                token,
            };
        }

        const balance = new BigNumber(await contract.methods.darknodeBalances(darknodeID, tokenDetails.address).call());

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


const sumUpFees = (feesEarned: OrderedMap<Token, BigNumber>, tokenPrices: TokenPrices): BigNumber => {

    let totalEth = new BigNumber(0);

    for (const token of Tokens) {
        const tokenDetails = TokenDetails.get(token, undefined);
        if (!tokenDetails) {
            continue;
        }

        const price = tokenPrices.get(token, undefined);
        const inEth = feesEarned.get(token, new BigNumber(0))
            .div(new BigNumber(Math.pow(10, tokenDetails ? tokenDetails.digits : 0)))
            .multipliedBy(price ? price.get(Currency.ETH, 0) : 0);
        totalEth = totalEth.plus(inEth);
    }

    // Convert to wei
    return totalEth.multipliedBy(new BigNumber(10).pow(18));
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

export type UpdateDarknodeStatisticsAction = (sdk: RenExSDK, darknodeID: string, tokenPrices: TokenPrices, index?: number) => (dispatch: Dispatch) => Promise<void>;
export const updateDarknodeStatistics: UpdateDarknodeStatisticsAction = (sdk, darknodeID, tokenPrices, index?) => async (dispatch) => {
    // Get eth Balance
    const ethBalanceBN = await sdk.getWeb3().eth.getBalance(darknodeID);
    const ethBalance = new BigNumber(ethBalanceBN.toString());

    // Get earned fees
    const feesEarned = await getBalances(sdk, darknodeID, tokenPrices);
    const feesEarnedTotalEth = sumUpFees(feesEarned, tokenPrices);

    // Get registration status
    const registrationStatus = await getDarknodeStatus(sdk, darknodeID);

    const darknodeDetails = new DarknodeDetails({
        ID: darknodeID,
        name: `Darknode${index !== undefined ? ` ${index + 1}` : ""}`,
        multiAddress: "" as string,
        publicKey: "" as string,
        ethBalance,
        feesEarned,
        feesEarnedTotalEth,

        averageGasUsage: 0,
        lastTopUp: null,
        expectedExhaustion: null,

        peers: 0,
        registrationStatus,
    });

    dispatch(setDarknodeDetails({ darknodeDetails }));
};

export type UpdateAllDarknodeStatisticsAction = (sdk: RenExSDK, darknodeList: List<string>, tokenPrices: TokenPrices) => (dispatch: Dispatch) => Promise<void>;
export const updateAllDarknodeStatistics: UpdateAllDarknodeStatisticsAction = (sdk, darknodeList, tokenPrices) => async (dispatch) => {
    await Promise.all(darknodeList.map((darknodeID, index) => {
        return updateDarknodeStatistics(sdk, darknodeID, tokenPrices, index)(dispatch);
    }).toArray());

    // TODO: Sum up rewards
};
