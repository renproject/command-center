import RenExSDK from "@renex/renex";
import BigNumber from "bignumber.js";

import { List, OrderedMap, OrderedSet } from "immutable";
import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { getOperatorDarknodes } from "../../lib/ethereum/operator";
import { Currency, DarknodeDetails, TokenPrices } from "../../reducers/types";

import { _captureBackgroundException_ } from "../../lib/errors";
import { contracts } from "../../lib/ethereum/contracts/contracts";
import { Token, Tokens } from "../../lib/ethereum/tokens";

export const addRegisteringDarknode = createStandardAction("ADD_REGISTERING_DARKNODE")<{
    darknodeID: string;
    publicKey: string;
}>();

export const removeRegisteringDarknode = createStandardAction("REMOVE_REGISTERING_DARKNODE")<{
    darknodeID: string;
}>();

export const storeDarknodeList = createStandardAction("STORE_DARKNODE_LIST")<{
    darknodeList: OrderedSet<string>;
    address: string;
}>();

export const storeQuoteCurrency = createStandardAction("SORE_QUOTE_CURRENCY")<{ quoteCurrency: Currency }>();

export const storeSecondsPerBlock = createStandardAction("SORE_BLOCKS_PER_SECOND")<{ secondsPerBlock: number }>();

export const setDarknodeDetails = createStandardAction("UPDATE_DARKNODE_DETAILS")<{
    darknodeDetails: DarknodeDetails;
}>();

export const updateDarknodeHistory = createStandardAction("UPDATE_DARKNODE_HISTORY")<{
    darknodeID: string;
    balanceHistory: OrderedMap<number, BigNumber>;
}>();

export const setDarknodeName = createStandardAction("UPDATE_DARKNODE_NAME")<{ darknodeID: string; name: string }>();

export const calculateSecondsPerBlock = (
    sdk: RenExSDK,
) => async (dispatch: Dispatch) => {
    const sampleSize = 1000;

    const web3 = sdk.getWeb3();
    const currentBlockNumber = await web3.eth.getBlockNumber();
    const currentBlock = await web3.eth.getBlock(currentBlockNumber);
    const previousBlock = await web3.eth.getBlock(currentBlockNumber - sampleSize);
    const secondsPerBlock = Math.floor((currentBlock.timestamp - previousBlock.timestamp) / sampleSize);

    dispatch(storeSecondsPerBlock({ secondsPerBlock }));
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

const getDarknodePublicKey = async (sdk: RenExSDK, darknodeID: string): Promise<string> => {
    const darknodeRegistry = new ((sdk.getWeb3()).eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );
    return darknodeRegistry.methods.getDarknodePublicKey(darknodeID).call();
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

    try {
        const [
            isPendingRegistration,
            isPendingDeregistration,
            isDeregisterable,
            isRefunded,
            isRefundable,
        ] = await Promise.all([
            darknodeRegistry.methods.isPendingRegistration(darknodeID).call(),
            darknodeRegistry.methods.isPendingDeregistration(darknodeID).call(),
            darknodeRegistry.methods.isDeregisterable(darknodeID).call(),
            darknodeRegistry.methods.isRefunded(darknodeID).call(),
            darknodeRegistry.methods.isRefundable(darknodeID).call(),
        ]);

        if (isRefunded) {
            return RegistrationStatus.Unregistered;
        } else if (isPendingRegistration) {
            return RegistrationStatus.RegistrationPending;
        } else if (isDeregisterable) {
            return RegistrationStatus.Registered;
        } else if (isPendingDeregistration) {
            return RegistrationStatus.DeregistrationPending;
        } else if (isRefundable) {
            return RegistrationStatus.Refundable;
        } else {
            return RegistrationStatus.Deregistered;
        }
    } catch (error) {
        _captureBackgroundException_(error, {
            description: "Unknown darknode registration status",
        });
        return RegistrationStatus.Unknown;
    }

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

    // Get darknode operator and public key
    const operator = await getDarknodeOperator(sdk, darknodeID);
    const publicKey = await getDarknodePublicKey(sdk, darknodeID);

    // Get registration status
    const registrationStatus = await getDarknodeStatus(sdk, darknodeID);

    const darknodeDetails = new DarknodeDetails({
        ID: darknodeID,
        multiAddress: "" as string,
        publicKey,
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
    currentDarknodes.map((darknodeID: string) => {
        if (!darknodeList.contains(darknodeID)) {
            darknodeList = darknodeList.push(darknodeID);
        }
    });

    await Promise.all(darknodeList.toList().map(async (darknodeID: string) => {
        return updateDarknodeStatistics(sdk, darknodeID, tokenPrices)(dispatch);
    }).toArray());
};

export const HistoryIterations = 5;

export enum HistoryPeriods {
    Day = 60 * 60 * 24,
    Week = Day * 7,
    Month = Week * 4,
    HalfYear = Week * 26,
    Year = Week * 52,
}

export const fetchDarknodeBalanceHistory = (
    sdk: RenExSDK,
    darknodeID: string,
    previousHistory: OrderedMap<number, BigNumber> | null,
    historyPeriod: HistoryPeriods,
    secondsPerBlock: number,
) => async (dispatch: Dispatch) => {
    let balanceHistory = previousHistory || OrderedMap<number, BigNumber>();

    // If the page is kept open, the history data will keep growing, so we limit
    // it to 200 entries.
    if (balanceHistory.size > 200) {
        balanceHistory = OrderedMap<number, BigNumber>();
    }

    const currentBlock = await sdk.getWeb3().eth.getBlockNumber();

    const jump = Math.floor((historyPeriod / secondsPerBlock) / HistoryIterations);

    for (let i = 0; i < HistoryIterations; i++) {
        // Move back by `jump` blocks
        let block = currentBlock - i * jump;

        // ...
        block = block - block % jump;

        if (!balanceHistory.has(block)) {
            const balance = new BigNumber((await sdk.getWeb3().eth.getBalance(darknodeID, block)).toString());
            balanceHistory = balanceHistory.set(block, balance);
        }
    }

    // Also add most recent block
    if (!balanceHistory.has(currentBlock)) {
        const currentBalance = await sdk.getWeb3().eth.getBalance(darknodeID, currentBlock);

        if (currentBalance) {
            const balance = new BigNumber(currentBalance.toString());
            balanceHistory = balanceHistory.set(currentBlock, balance);
        }
    }

    balanceHistory = balanceHistory.sortBy((_: BigNumber, value: number) => value);

    dispatch(updateDarknodeHistory({ darknodeID, balanceHistory }));
};
