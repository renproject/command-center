import RenExSDK from "@renex/renex";
import BigNumber from "bignumber.js";

import { List, OrderedMap, OrderedSet } from "immutable";
import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { getOperatorDarknodes } from "../../lib/statistics/operator";
import { Currency, DarknodeDetails, TokenPrices } from "../../reducers/types";

import { contracts } from "../../lib/contracts/contracts";
import { Token, Tokens } from "../../lib/tokens";

export const addRegisteringDarknode = createStandardAction("ADD_REGISTERING_DARKNODE")<{
    darknodeID: string;
    publicKey: string;
}>();

export const storeDarknodeList = createStandardAction("STORE_DARKNODE_LIST")<{
    darknodeList: OrderedSet<string>;
    address: string;
}>();

export const storeQuoteCurrency = createStandardAction("SORE_QUOTE_CURRENCY")<{ quoteCurrency: Currency; }>();

export const setDarknodeDetails = createStandardAction("UPDATE_DARKNODE_DETAILS")<{
    darknodeDetails: DarknodeDetails;
}>();

export const setDarknodeName = createStandardAction("UPDATE_DARKNODE_NAME")<{ darknodeID: string, name: string }>();

export const updateOperatorStatistics = (
    sdk: RenExSDK,
    address: string,
    tokenPrices: TokenPrices | null,
    previousDarknodeList: List<string> | null,
) => async (dispatch: Dispatch) => {

    let darknodeList = previousDarknodeList || List<string>();

    const currentDarknodes = await getOperatorDarknodes(sdk, address);
    dispatch(storeDarknodeList({ darknodeList: currentDarknodes, address }));

    // The lists are merged in the reducer as well, but we combine them again
    // before passing into `updateDarknodeStatistics`
    currentDarknodes.map((darknodeID) => {
        if (!darknodeList.contains(darknodeID)) {
            darknodeList = darknodeList.push(darknodeID);
        }
    });

    await Promise.all(darknodeList.toList().map((darknodeID) => {
        return updateDarknodeStatistics(sdk, darknodeID, tokenPrices)(dispatch);
    }).toArray());
};

const getBalances = async (sdk: RenExSDK, darknodeID: string): Promise<OrderedMap<Token, BigNumber>> => {

    const contract = new (sdk.getWeb3().eth.Contract)(
        contracts.DarknodeRewardVault.ABI,
        contracts.DarknodeRewardVault.address,
    );

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

const sumUpFees = async (
    sdk: RenExSDK,
    feesEarned: OrderedMap<Token, BigNumber>,
    tokenPrices: TokenPrices,
): Promise<BigNumber> => {

    let totalEth = new BigNumber(0);

    for (const token of Tokens) {
        const tokenDetails = await sdk._cachedTokenDetails.get(token);
        if (!tokenDetails) {
            continue;
        }

        const price = tokenPrices.get(token, undefined);
        const decimals = tokenDetails ? new BigNumber(tokenDetails.decimals.toString()).toNumber() : 0;
        const inEth = feesEarned.get(token, new BigNumber(0))
            .div(Math.pow(10, decimals))
            .multipliedBy(price ? price.get(Currency.ETH, 0) : 0);
        totalEth = totalEth.plus(inEth);
    }

    // Convert to wei
    return totalEth.multipliedBy(new BigNumber(10).pow(18));
};

const getDarknodeOperator = async (sdk: RenExSDK, darknodeID: string): Promise<string> => {
    const darknodeRegistry = new ((sdk.getWeb3()).eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );
    return darknodeRegistry.methods.getDarknodeOwner(darknodeID).call();
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
    const darknodeRegistry = new ((sdk.getWeb3()).eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );
    return new Promise<RegistrationStatus>((resolve) => {
        Promise.all([
            darknodeRegistry.methods.isPendingRegistration(darknodeID).call(),
            darknodeRegistry.methods.isPendingDeregistration(darknodeID).call(),
            darknodeRegistry.methods.isDeregisterable(darknodeID).call(),
            darknodeRegistry.methods.isRefunded(darknodeID).call(),
            darknodeRegistry.methods.isRefundable(darknodeID).call(),
            darknodeRegistry.methods.isRegistered(darknodeID).call(),
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

export const updateDarknodeStatistics = (
    sdk: RenExSDK,
    darknodeID: string,
    tokenPrices: TokenPrices | null,
) => async (dispatch: Dispatch) => {
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
