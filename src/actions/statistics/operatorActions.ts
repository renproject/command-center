import RenExSDK from "@renex/renex";
import BigNumber from "bignumber.js";

import { Map, OrderedMap, OrderedSet } from "immutable";
import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { getOperatorDarknodes } from "@Library/statistics/operator";
import { Currency, DarknodeDetails, TokenPrices } from "@Reducers/types";

import { contracts } from "@Library/contracts/contracts";
import { Token, Tokens } from "@Library/tokens";

export const storeDarknodeList = createStandardAction("STORE_DARKNODE_LIST")<{
    darknodeList: OrderedSet<string>;
    address: string;
}>();

export const storeQuoteCurrency = createStandardAction("SORE_QUOTE_CURRENCY")<{ quoteCurrency: Currency; }>();

export const setDarknodeDetails = createStandardAction("UPDATE_DARKNODE_DETAILS")<{ darknodeDetails: DarknodeDetails; }>();

export const setDarknodeName = createStandardAction("UPDATE_DARKNODE_NAME")<{ darknodeID: string, name: string }>();

export const updateOperatorStatistics = (sdk: RenExSDK, address: string, tokenPrices: TokenPrices, previousDarknodeDetails: Map<string, DarknodeDetails>) => async (dispatch: Dispatch) => {

    const darknodeList = await getOperatorDarknodes(sdk, address);
    dispatch(storeDarknodeList({ darknodeList, address }));

    console.log(darknodeList.toJSON());


    await Promise.all(darknodeList.toList().map((darknodeID, index) => {
        const previousDetails = previousDarknodeDetails.get(darknodeID);
        return updateDarknodeStatistics(sdk, darknodeID, tokenPrices, previousDetails, index)(dispatch);
    }).toArray());
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
    RegistrationPending = "registration pending",
    Registered = "registered",
    DeregistrationPending = "deregistration pending",
    Deregistered = "awaiting refund period",
    Refundable = "refundable",
}

const getDarknodeStatus = async (sdk: RenExSDK, darknodeID: string): Promise<RegistrationStatus> => {

    return new Promise<RegistrationStatus>((resolve) => {
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
                registrationStatus = RegistrationStatus.Refundable;
            } else {
                registrationStatus = RegistrationStatus.Deregistered;
            }
            resolve(registrationStatus);
        })
            .catch((error) => resolve(RegistrationStatus.Unknown));
    });
};

export const updateDarknodeStatistics = (sdk: RenExSDK, darknodeID: string, tokenPrices: TokenPrices | null, previousDetails: DarknodeDetails | undefined, index?: number) => async (dispatch: Dispatch) => {
    darknodeID = sdk.getWeb3().utils.toChecksumAddress(darknodeID.toLowerCase());

    // Get eth Balance
    const ethBalanceBN = await sdk.getWeb3().eth.getBalance(darknodeID);
    const ethBalance = new BigNumber(ethBalanceBN.toString());

    // Get earned fees
    const feesEarned = await getBalances(sdk, darknodeID);
    let feesEarnedTotalEth = new BigNumber(0);
    if (tokenPrices) {
        feesEarnedTotalEth = await sumUpFees(sdk, feesEarned, tokenPrices);
    }

    // Get darknode operator
    const operator = await getDarknodeOperator(sdk, darknodeID);

    // Get registration status
    const registrationStatus = await getDarknodeStatus(sdk, darknodeID);

    const darknodeDetails = new DarknodeDetails({
        ID: darknodeID,
        index: previousDetails && previousDetails.index !== undefined ? previousDetails.index : index,
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
