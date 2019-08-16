import {} from "redux";

import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import { createStandardAction } from "typesafe-actions";

import { getPrices, Token, TokenPrices } from "../../lib/ethereum/tokens";
import { AppDispatch } from "../rootReducer";

export const storeTokenPrices = createStandardAction("STORE_TOKEN_PRICES")<TokenPrices>();

export const updateCurrentCycle = createStandardAction("UPDATE_CURRENT_CYCLE")<string>();
export const updatePreviousCycle = createStandardAction("UPDATE_PREVIOUS_CYCLE")<string>();

export const updatePendingRewards = createStandardAction("UPDATE_PENDING_REWARDS")<OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>>();
export const updatePendingTotalInEth = createStandardAction("UPDATE_PENDING_TOTAL_IN_ETH")<OrderedMap<string /* cycle */, BigNumber>>();
export const updatePendingRewardsInEth = createStandardAction("UPDATE_PENDING_REWARDS_IN_ETH")<OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>>();
export const updateCycleTimeout = createStandardAction("UPDATE_CYCLE_TIMEOUT")<BigNumber>();

export const updateTokenPrices = () => async (dispatch: AppDispatch) => {
    const tokenPrices = await getPrices();
    dispatch(storeTokenPrices(tokenPrices));
};
