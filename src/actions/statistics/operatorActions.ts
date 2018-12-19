import RenExSDK from "@renex/renex";
import BigNumber from "bignumber.js";

import { List, Map, OrderedMap } from "immutable";
import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { getOperatorDarknodes } from "@Library/statistics/operator";
import { Currency, DarknodeDetails, TokenPrices } from "@Reducers/types";

// Legacy
import contracts from "@Library/contracts/contracts";
import { Token, Tokens } from "@Library/tokens";

interface StoreDarknodeListPayload { darknodeList: List<string>; address: string; }
export type StoreDarknodeListAction = (payload: StoreDarknodeListPayload) => void;
export const storeDarknodeList = createStandardAction("STORE_DARKNODE_LIST")<StoreDarknodeListPayload>();

interface StoreQuoteCurrencyPayload { quoteCurrency: Currency; }
export type StoreQuoteCurrencyAction = (payload: StoreQuoteCurrencyPayload) => void;
export const storeQuoteCurrency = createStandardAction("SORE_QUOTE_CURRENCY")<StoreQuoteCurrencyPayload>();

interface SetDarknodeDetailsPayload { darknodeDetails: DarknodeDetails; }
export type SetDarknodeDetailsAction = (payload: SetDarknodeDetailsPayload) => void;
export const setDarknodeDetails = createStandardAction("UPDATE_DARKNODE_DETAILS")<SetDarknodeDetailsPayload>();

export type UpdateOperatorStatisticsAction = (sdk: RenExSDK, address: string) => (dispatch: Dispatch) => Promise<void>;
export const updateOperatorStatistics: UpdateOperatorStatisticsAction = (sdk, address) => async (dispatch) => {
    const darknodeList = await getOperatorDarknodes(sdk, address);
    dispatch(storeDarknodeList({ darknodeList, address }));
};

const getBalances = async (sdk: RenExSDK, darknodeID: string): Promise<OrderedMap<Token, BigNumber>> => {

    const contract = new (sdk.getWeb3().eth.Contract)(contracts.DarknodeRewardVault.ABI, contracts.DarknodeRewardVault.address);

    let feesEarned = OrderedMap<Token, BigNumber>();

    const balances = Tokens.map(async (token: Token) => {
        const tokenDetails = await sdk._cachedTokenDetails.get(token);
        if (!tokenDetails) {
            return {
                balance: new BigNumber(0),
                token,
            };
        }

        const balance = new BigNumber(await contract.methods.darknodeBalances(darknodeID, tokenDetails.addr).call());

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


const sumUpFees = async (sdk: RenExSDK, feesEarned: OrderedMap<Token, BigNumber>, tokenPrices: TokenPrices): Promise<BigNumber> => {

    let totalEth = new BigNumber(0);

    for (const token of Tokens) {
        const tokenDetails = await sdk._cachedTokenDetails.get(token);
        if (!tokenDetails) {
            continue;
        }

        const price = tokenPrices.get(token, undefined);
        const inEth = feesEarned.get(token, new BigNumber(0))
            .div(new BigNumber(Math.pow(10, tokenDetails ? new BigNumber(tokenDetails.decimals.toString()).toNumber() : 0)))
            .multipliedBy(price ? price.get(Currency.ETH, 0) : 0);
        totalEth = totalEth.plus(inEth);
    }

    // Convert to wei
    return totalEth.multipliedBy(new BigNumber(10).pow(18));
};


const getDarknodeOperator = async (sdk: RenExSDK, darknodeID: string): Promise<string> => {
    return sdk._contracts.darknodeRegistry.getDarknodeOwner(darknodeID, {});
};

export enum RegistrationStatus {
    Unknown = "",
    Unregistered = "unregistered",
    RegistrationPending = "registrationPending",
    Registered = "registered",
    DeregistrationPending = "deregistrationPending",
    AwaitingRefund = "awaitingRefund",
}

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
            let registrationStatus = RegistrationStatus.Unknown;
            if (res.isRefunded) {
                registrationStatus = RegistrationStatus.Unregistered;
            } else if (res.isPendingRegistration) {
                registrationStatus = RegistrationStatus.RegistrationPending;
            } else if (res.isDeregisterable) {
                registrationStatus = RegistrationStatus.Registered;
            } else if (res.isPendingDeregistration) {
                registrationStatus = RegistrationStatus.DeregistrationPending;
            } else if (res.isRefundable) {
                registrationStatus = RegistrationStatus.AwaitingRefund;
            }
            resolve(registrationStatus);
        })
            .catch(console.error);
    });
};

export type UpdateDarknodeStatisticsAction = (sdk: RenExSDK, darknodeID: string, tokenPrices: TokenPrices, previousDetails: DarknodeDetails | undefined, index?: number) => (dispatch: Dispatch) => Promise<void>;
export const updateDarknodeStatistics: UpdateDarknodeStatisticsAction = (sdk, darknodeID, tokenPrices, previousDetails, index?) => async (dispatch) => {
    darknodeID = sdk.getWeb3().utils.toChecksumAddress(darknodeID.toLowerCase());

    // Get eth Balance
    const ethBalanceBN = await sdk.getWeb3().eth.getBalance(darknodeID);
    const ethBalance = new BigNumber(ethBalanceBN.toString());

    // Get earned fees
    const feesEarned = await getBalances(sdk, darknodeID);
    const feesEarnedTotalEth = await sumUpFees(sdk, feesEarned, tokenPrices);

    // Get darknode operator
    const operator = await getDarknodeOperator(sdk, darknodeID);

    // Get registration status
    const registrationStatus = await getDarknodeStatus(sdk, darknodeID);

    const darknodeDetails = new DarknodeDetails({
        ID: darknodeID,
        name: (previousDetails && previousDetails.name) || `Darknode${index !== undefined ? ` ${index + 1}` : ""}`,
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
        operator,
    });

    dispatch(setDarknodeDetails({ darknodeDetails }));
};

export type UpdateAllDarknodeStatisticsAction = (sdk: RenExSDK, darknodeList: List<string>, tokenPrices: TokenPrices, previousDarknodeDetails: Map<string, DarknodeDetails>) => (dispatch: Dispatch) => Promise<void>;
export const updateAllDarknodeStatistics: UpdateAllDarknodeStatisticsAction = (sdk, darknodeList, tokenPrices, previousDarknodeDetails) => async (dispatch) => {
    await Promise.all(darknodeList.map((darknodeID, index) => {
        const previousDetails = previousDarknodeDetails.get(darknodeID);
        return updateDarknodeStatistics(sdk, darknodeID, tokenPrices, previousDetails, index)(dispatch);
    }).toArray());

    // TODO: Sum up rewards
};
