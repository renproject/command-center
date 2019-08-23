import { RenNetworkDetails } from "@renproject/contracts";
import { Currency } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { List, OrderedMap } from "immutable";
import { createStandardAction } from "typesafe-actions";
import Web3 from "web3";
import { PromiEvent } from "web3-core";

import {
    calculateSecondsPerBlock, fetchCycleAndPendingRewards, fetchDarknodeBalanceHistory,
    fetchDarknodeDetails, getDarknodeCounts, getOperatorDarknodes, HistoryPeriod,
} from "../../lib/ethereum/contractReads";
import { Token, TokenPrices } from "../../lib/ethereum/tokens";
import { DarknodesState } from "../applicationState";
import { AppDispatch } from "../rootReducer";
import {
    updateCurrentCycle, updateCurrentShareCount, updateCycleTimeout, updateDarknodeCounts,
    updatePendingRewards, updatePendingRewardsInEth, updatePendingTotalInEth, updatePreviousCycle,
} from "./networkActions";

export const addRegisteringDarknode = createStandardAction("ADD_REGISTERING_DARKNODE")<{
    darknodeID: string;
    publicKey: string;
}>();

export const removeRegisteringDarknode = createStandardAction("REMOVE_REGISTERING_DARKNODE")<{
    darknodeID: string;
}>();

export const removeDarknode = createStandardAction("REMOVE_DARKNODE")<{
    darknodeID: string;
    operator: string;
    network: string;
}>();

export const addDarknode = createStandardAction("ADD_DARKNODE")<{
    darknodeID: string;
    address: string;
    network: string;
}>();

export const setEmptyDarknodeList = createStandardAction("SET_EMPTY_DARKNODE_LIST")<{
    address: string;
    network: string;
}>();

export const storeQuoteCurrency = createStandardAction("STORE_QUOTE_CURRENCY")<{ quoteCurrency: Currency }>();

export const storeRegistrySync = createStandardAction("STORE_REGISTRY_SYNC")<{ progress: number, target: number }>();

export const storeSecondsPerBlock = createStandardAction("STORE_SECONDS_PER_BLOCK")<{ secondsPerBlock: number }>();

export const addToWithdrawAddresses = createStandardAction("ADD_TO_WITHDRAW_ADDRESSES")<{ token: Token, address: string }>();
export const removeFromWithdrawAddresses = createStandardAction("REMOVE_FROM_WITHDRAW_ADDRESSES")<{ token: Token, address: string }>();

export const setDarknodeDetails = createStandardAction("SET_DARKNODE_DETAILS")<{
    darknodeDetails: DarknodesState;
}>();

export const updateDarknodeHistory = createStandardAction("UPDATE_DARKNODE_HISTORY")<{
    darknodeID: string;
    balanceHistory: OrderedMap<number, BigNumber>;
}>();

export const setDarknodeName = createStandardAction("SET_DARKNODE_NAME")<{ darknodeID: string; name: string }>();

// tslint:disable-next-line: no-any
export const addTransaction = createStandardAction("ADD_TRANSACTION")<{ txHash: string; tx: PromiEvent<any> }>();
export const setTxConfirmations = createStandardAction("SET_TX_CONFIRMATIONS")<{ txHash: string; confirmations: number }>();

export const updateSecondsPerBlock = (
    web3: Web3,
) => async (dispatch: AppDispatch) => {
    const secondsPerBlock = await calculateSecondsPerBlock(web3);
    if (secondsPerBlock !== null) {
        dispatch(storeSecondsPerBlock({ secondsPerBlock }));
    }
};

export const updateCycleAndPendingRewards = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    tokenPrices: TokenPrices | null,
) => async (dispatch: AppDispatch) => {
    const getDarknodeCountsPromise = getDarknodeCounts(web3, renNetwork);
    const fetchCycleAndPendingRewardsPromise = fetchCycleAndPendingRewards(web3, renNetwork, tokenPrices);

    try {
        const darknodeCounts = await getDarknodeCountsPromise;
        dispatch(updateDarknodeCounts(darknodeCounts));
    } catch (error) {
        // Ignore error
    }

    const {
        pendingRewards,
        currentCycle,
        previousCycle,
        cycleTimeout,
        pendingTotalInEth,
        pendingRewardsInEth,
        currentShareCount,
    } = await fetchCycleAndPendingRewardsPromise;

    if (pendingRewardsInEth !== null) {
        dispatch(updatePendingRewardsInEth(pendingRewardsInEth));
    }
    if (pendingTotalInEth !== null) {
        dispatch(updatePendingTotalInEth(pendingTotalInEth));
    }
    if (currentCycle !== null) {
        dispatch(updateCurrentCycle(currentCycle.toString()));
    }
    if (previousCycle !== null) {
        dispatch(updatePreviousCycle(previousCycle.toString()));
    }
    dispatch(updatePendingRewards(pendingRewards));
    if (cycleTimeout !== null) {
        dispatch(updateCycleTimeout(cycleTimeout));
    }
    if (currentShareCount !== null) {
        dispatch(updateCurrentShareCount(currentShareCount));
    }
};

export const updateDarknodeDetails = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    darknodeID: string,
    tokenPrices: TokenPrices | null,
) => async (dispatch: AppDispatch) => {
    const darknodeDetails = await fetchDarknodeDetails(web3, renNetwork, darknodeID, tokenPrices);
    dispatch(setDarknodeDetails({ darknodeDetails }));
};

export const updateOperatorDarknodes = (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    address: string,
    tokenPrices: TokenPrices | null,
    previousDarknodeList: List<string> | null,
) => async (dispatch: AppDispatch) => {
    // await dispatch(updateCycleAndPendingRewards(web3, renNetwork, tokenPrices));

    let darknodeList = previousDarknodeList || List<string>();

    const currentDarknodes = await getOperatorDarknodes(web3, renNetwork, address, (darknodeID) => {
        dispatch(addDarknode({ darknodeID, address, network: renNetwork.name }));
    }, (progress, target) => {
        if (previousDarknodeList === null) {
            dispatch(storeRegistrySync({ progress, target }));
        }
    });

    // The lists are merged in the reducer as well, but we combine them again
    // before passing into `updateDarknodeDetails`
    currentDarknodes.map((darknodeID: string) => {
        if (!darknodeList.contains(darknodeID)) {
            darknodeList = darknodeList.push(darknodeID);
        }
        return null;
    });

    await Promise.all(darknodeList.toList().map(async (darknodeID: string) => {
        return dispatch(updateDarknodeDetails(web3, renNetwork, darknodeID, tokenPrices));
    }).toArray());

    if (darknodeList.size === 0) {
        dispatch(setEmptyDarknodeList({ address, network: renNetwork.name }));
    }
};

export const updateDarknodeBalanceHistory = (
    web3: Web3,
    darknodeID: string,
    previousHistory: OrderedMap<number, BigNumber> | null,
    historyPeriod: HistoryPeriod,
    secondsPerBlock: number,
) => async (dispatch: AppDispatch) => {
    const balanceHistory = await fetchDarknodeBalanceHistory(web3, darknodeID, previousHistory, historyPeriod, secondsPerBlock);
    dispatch(updateDarknodeHistory({ darknodeID, balanceHistory }));
};
