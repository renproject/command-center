import BigNumber from "bignumber.js";
import Web3 from "web3";

import { List, OrderedMap, OrderedSet } from "immutable";
import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";
import { Block } from "web3-eth";
import { toChecksumAddress } from "web3-utils";

import { getOperatorDarknodes } from "../../../lib/ethereum/operator";
import { Currency, DarknodeDetails, DarknodeFeeStatus, TokenPrices } from "../../types";

import { _captureBackgroundException_ } from "../../../lib/errors";
import { DarknodePaymentWeb3 } from "../../../lib/ethereum/contracts/bindings/darknodePayment";
import { DarknodePaymentStoreWeb3 } from "../../../lib/ethereum/contracts/bindings/darknodePaymentStore";
import { DarknodeRegistryWeb3 } from "../../../lib/ethereum/contracts/bindings/darknodeRegistry";
import { contracts } from "../../../lib/ethereum/contracts/contracts";
import { NewTokenDetails, OldToken, OldTokenDetails, Token } from "../../../lib/ethereum/tokens";
import { updateCurrentCycle, updatePendingRewards, updatePendingTotalInEth, updatePreviousCycle } from "./networkActions";

export const addRegisteringDarknode = createStandardAction("addRegisteringDarknode")<{
    darknodeID: string;
    publicKey: string;
}>();

export const removeRegisteringDarknode = createStandardAction("removeRegisteringDarknode")<{
    darknodeID: string;
}>();

export const removeDarknode = createStandardAction("removeDarknode")<{
    darknodeID: string;
    operator: string;
}>();

export const storeDarknodeList = createStandardAction("storeDarknodeList")<{
    darknodeList: OrderedSet<string>;
    address: string;
}>();

export const storeQuoteCurrency = createStandardAction("storeQuoteCurrency")<{ quoteCurrency: Currency }>();

export const storeSecondsPerBlock = createStandardAction("storeSecondsPerBlock")<{ secondsPerBlock: number }>();

export const addToWithdrawAddresses = createStandardAction("addToWithdrawAddresses")<{ token: Token, address: string }>();

export const setDarknodeDetails = createStandardAction("setDarknodeDetails")<{
    darknodeDetails: DarknodeDetails;
}>();

export const updateDarknodeHistory = createStandardAction("updateDarknodeHistory")<{
    darknodeID: string;
    balanceHistory: OrderedMap<number, BigNumber>;
}>();

export const setDarknodeName = createStandardAction("setDarknodeName")<{ darknodeID: string; name: string }>();

export const calculateSecondsPerBlock = (
    web3: Web3,
) => async (dispatch: Dispatch) => {
    const sampleSize = 1000;

    const fetchedBlockNumber = await web3.eth.getBlockNumber();
    let currentBlockNumber = fetchedBlockNumber;
    let currentBlock: Block | null = null;
    // If current block isn't know yet, try previous block, up to 10 times
    while (currentBlock === null && currentBlockNumber > fetchedBlockNumber - 10) {
        currentBlock = await web3.eth.getBlock(currentBlockNumber);
        currentBlockNumber -= 1;
    }
    const previousBlock: Block | null = await web3.eth.getBlock(currentBlockNumber - sampleSize);

    if (currentBlock !== null && previousBlock !== null) {
        const secondsPerBlock = Math.floor((currentBlock.timestamp - previousBlock.timestamp) / sampleSize);

        dispatch(storeSecondsPerBlock({ secondsPerBlock }));
    }
};

const getOldBalances = async (web3: Web3, darknodeID: string): Promise<OrderedMap<OldToken, BigNumber>> => {

    const contract = new (web3.eth.Contract)(
        contracts.DarknodeRewardVault.ABI,
        contracts.DarknodeRewardVault.address,
    );

    let feesEarned = OrderedMap<OldToken, BigNumber>();

    const balances = OldTokenDetails.map(async (tokenDetails, token) => {

        const balance = new BigNumber(await contract.methods.darknodeBalances(darknodeID, tokenDetails.address).call());

        return {
            balance,
            token,
        };
    }).valueSeq();
    // TODO: Don't use Promise.all
    const res = await Promise.all(balances);

    for (const { balance, token } of res) {
        feesEarned = feesEarned.set(token, balance);
    }

    return feesEarned;
};

const getBalances = async (web3: Web3, darknodeID: string): Promise<OrderedMap<Token, BigNumber>> => {

    const contract: DarknodePaymentWeb3 = new (web3.eth.Contract)(
        contracts.DarknodePayment.ABI,
        contracts.DarknodePayment.address,
    );

    let feesEarned = OrderedMap<Token, BigNumber>();

    const address = (await web3.eth.getAccounts())[0];

    const balances = NewTokenDetails.map(async (tokenDetails, token) => {
        const balance1 = new BigNumber((await contract.methods.darknodeBalances(darknodeID, tokenDetails.address).call()).toString());
        // const balance2 = tokenDetails.wrapped ? await new (web3.eth.Contract)(
        //     contracts.WarpGateToken.ABI,
        //     tokenDetails.address,
        // ).methods.balanceOf(address).call() : new BigNumber(0);

        return {
            balance: balance1, // .plus(balance2),
            token,
        };
    }).valueSeq();
    // TODO: Don't use Promise.all
    const res = await Promise.all(balances);

    for (const { balance, token } of res) {
        feesEarned = feesEarned.set(token, balance);
    }

    return feesEarned;
};

// The same as Promise.all except that if an entry throws, it sets it to the
// provided default value instead of throwing the entire promise.
// This variation maps over an OrderedMap instead of an array.
const safePromiseAllMap = async <a, b>(orderedMap: OrderedMap<a, Promise<b>>, defaultValue: b): Promise<OrderedMap<a, b>> => {
    let newOrderedMap = OrderedMap<a, b>();
    for (const [key, valueP] of orderedMap.toArray()) {
        try {
            newOrderedMap = newOrderedMap.set(key, await valueP);
        } catch (error) {
            console.error(error);
            newOrderedMap = newOrderedMap.set(key, defaultValue);
        }
    }
    return newOrderedMap;
};

const sumUpFeeMap = (
    feesEarned: OrderedMap<Token | OldToken, BigNumber>,
    tokenPrices: TokenPrices,
): BigNumber => {

    let totalEth = new BigNumber(0);

    NewTokenDetails.map((tokenDetails, token) => {
        const price = tokenPrices.get(token, undefined);
        const decimals = tokenDetails ? new BigNumber(tokenDetails.decimals.toString()).toNumber() : 0;
        const inEth = feesEarned.get(token, new BigNumber(0))
            .div(Math.pow(10, decimals))
            .multipliedBy(price ? price.get(Currency.ETH, 0) : 0);
        totalEth = totalEth.plus(inEth);
    });

    // Convert to wei
    return totalEth.multipliedBy(new BigNumber(10).pow(18));
};

const sumUpFees = (
    feesEarned: OrderedMap<Token, BigNumber>,
    oldFeesEarned: OrderedMap<OldToken, BigNumber>,
    tokenPrices: TokenPrices,
): BigNumber => {
    return sumUpFeeMap(feesEarned, tokenPrices).plus(sumUpFeeMap(oldFeesEarned, tokenPrices));
};

const updateCycleAndPendingRewards = (
    web3: Web3,
    tokenPrices: TokenPrices | null,
) => async (dispatch: Dispatch) => {
    const darknodePayment: DarknodePaymentWeb3 = new (web3.eth.Contract)(
        contracts.DarknodePayment.ABI,
        contracts.DarknodePayment.address,
    );

    const currentCycle = (await darknodePayment.methods.currentCycle().call()).toString();
    const previousCycle = (await darknodePayment.methods.previousCycle().call()).toString();

    const previous = await safePromiseAllMap(
        NewTokenDetails.map(async (tokenDetails, token) =>
            new BigNumber((await darknodePayment.methods.previousCycleRewardShare(tokenDetails.address).call()).toString())
        ).toOrderedMap(),
        new BigNumber(0),
    );

    const currentShareCount = new BigNumber((await darknodePayment.methods.shareCount().call()).toString());
    const current = await safePromiseAllMap(
        NewTokenDetails.map(async (tokenDetails, token) =>
            new BigNumber((await darknodePayment.methods.currentCycleRewardPool(tokenDetails.address).call()).toString()).div(currentShareCount)
        ).toOrderedMap(),
        new BigNumber(0),
    );

    const pendingRewards = OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>()
        .set(previousCycle, previous)
        .set(currentCycle, current)
        ;

    dispatch(updateCurrentCycle(currentCycle));
    dispatch(updatePreviousCycle(previousCycle));
    dispatch(updatePendingRewards(pendingRewards));

    if (tokenPrices) {
        const previousTotal = sumUpFeeMap(previous, tokenPrices);
        const currentTotal = sumUpFeeMap(current, tokenPrices);
        const pendingTotalInEth = OrderedMap<string /* cycle */, BigNumber>()
            .set(previousCycle, previousTotal)
            .set(currentCycle, currentTotal)
            ;
        dispatch(updatePendingTotalInEth(pendingTotalInEth));
    }
};

const getDarknodeOperator = async (web3: Web3, darknodeID: string): Promise<string> => {
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );
    return darknodeRegistry.methods.getDarknodeOwner(darknodeID).call();
};

const getDarknodePublicKey = async (web3: Web3, darknodeID: string): Promise<string> => {
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
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

const getDarknodeStatus = async (web3: Web3, darknodeID: string): Promise<RegistrationStatus> => {
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
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
    web3: Web3,
    darknodeID: string,
    tokenPrices: TokenPrices | null,
) => async (dispatch: Dispatch) => {
    darknodeID = toChecksumAddress(darknodeID.toLowerCase());

    // Get eth Balance
    const ethBalanceBN = await web3.eth.getBalance(darknodeID);

    let ethBalance = new BigNumber(0);
    if (ethBalanceBN) {
        ethBalance = new BigNumber(ethBalanceBN.toString());
    }

    // Get earned fees
    const feesEarned = await getBalances(web3, darknodeID);
    const oldFeesEarned = await getOldBalances(web3, darknodeID);
    let feesEarnedTotalEth = new BigNumber(0);
    if (tokenPrices) {
        feesEarnedTotalEth = await sumUpFees(feesEarned, oldFeesEarned, tokenPrices);
    }

    // Get darknode operator and public key
    const operator = await getDarknodeOperator(web3, darknodeID);
    const publicKey = await getDarknodePublicKey(web3, darknodeID);

    // Get registration status
    const registrationStatus = await getDarknodeStatus(web3, darknodeID);

    // Cycle status ////////////////////////////////////////////////////////////

    const darknodePayment: DarknodePaymentWeb3 = new (web3.eth.Contract)(
        contracts.DarknodePayment.ABI,
        contracts.DarknodePayment.address,
    );

    const darknodePaymentStore: DarknodePaymentStoreWeb3 = new (web3.eth.Contract)(
        contracts.DarknodePaymentStore.ABI,
        contracts.DarknodePaymentStore.address,
    );

    const currentCycle = (await darknodePayment.methods.currentCycle().call()).toString();
    const previousCycle = (await darknodePayment.methods.previousCycle().call()).toString();
    const blacklisted = await darknodePaymentStore.methods.isBlacklisted(darknodeID).call();
    let currentStatus;
    let previousStatus;
    if (blacklisted) {
        currentStatus = DarknodeFeeStatus.BLACKLISTED;
        previousStatus = DarknodeFeeStatus.BLACKLISTED;
    } else {
        const whitelistedTime = new BigNumber((await darknodePaymentStore.methods.darknodeWhitelist(darknodeID).call()).toString());
        if (whitelistedTime.isZero()) {
            currentStatus = DarknodeFeeStatus.NOT_WHITELISTED;
            previousStatus = DarknodeFeeStatus.NOT_WHITELISTED;
        } else {
            currentStatus = DarknodeFeeStatus.NOT_CLAIMED;
            const cycleStartTime = new BigNumber((await darknodePayment.methods.cycleStartTime().call()).toString());
            if (whitelistedTime.gte(cycleStartTime)) {
                previousStatus = DarknodeFeeStatus.NOT_WHITELISTED;
            } else {
                const claimed = await darknodePayment.methods.rewardClaimed(darknodeID, previousCycle).call();
                if (claimed) {
                    previousStatus = DarknodeFeeStatus.CLAIMED;
                } else {
                    previousStatus = DarknodeFeeStatus.NOT_CLAIMED;
                }
            }
        }
    }

    // Store details ///////////////////////////////////////////////////////////

    let darknodeDetails = new DarknodeDetails({
        ID: darknodeID,
        multiAddress: "" as string,
        publicKey,
        ethBalance,
        feesEarned,
        oldFeesEarned,
        feesEarnedTotalEth,

        cycleStatus: OrderedMap<string, DarknodeFeeStatus>()
            .set(currentCycle, currentStatus)
            .set(previousCycle, previousStatus),

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
    web3: Web3,
    address: string,
    tokenPrices: TokenPrices | null,
    previousDarknodeList: List<string> | null,
) => async (dispatch: Dispatch) => {
    await updateCycleAndPendingRewards(web3, tokenPrices)(dispatch);

    let darknodeList = previousDarknodeList || List<string>();

    const currentDarknodes = await getOperatorDarknodes(web3, address);
    dispatch(storeDarknodeList({ darknodeList: currentDarknodes, address }));

    // The lists are merged in the reducer as well, but we combine them again
    // before passing into `updateDarknodeStatistics`
    currentDarknodes.map((darknodeID: string) => {
        if (!darknodeList.contains(darknodeID)) {
            darknodeList = darknodeList.push(darknodeID);
        }
    });

    await Promise.all(darknodeList.toList().map(async (darknodeID: string) => {
        return updateDarknodeStatistics(web3, darknodeID, tokenPrices)(dispatch);
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
    web3: Web3,
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

    const currentBlock = await web3.eth.getBlockNumber();

    const jump = Math.floor((historyPeriod / secondsPerBlock) / HistoryIterations);

    for (let i = 0; i < HistoryIterations; i++) {
        // Move back by `jump` blocks
        let block = currentBlock - i * jump;

        // ...
        block = block - block % jump;

        if (!balanceHistory.has(block)) {
            const blockBalance = await web3.eth.getBalance(darknodeID, block);

            if (blockBalance !== null) {
                const balance = new BigNumber(blockBalance.toString());
                balanceHistory = balanceHistory.set(block, balance);
            }
        }
    }

    // Also add most recent block
    if (!balanceHistory.has(currentBlock)) {
        const currentBalance = await web3.eth.getBalance(darknodeID, currentBlock);

        if (currentBalance !== null) {
            const balance = new BigNumber(currentBalance.toString());
            balanceHistory = balanceHistory.set(currentBlock, balance);
        }
    }

    balanceHistory = balanceHistory.sortBy((_: BigNumber, value: number) => value);

    dispatch(updateDarknodeHistory({ darknodeID, balanceHistory }));
};
