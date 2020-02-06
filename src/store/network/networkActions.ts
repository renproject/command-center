import {} from "redux";

import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import { createAction } from "typesafe-actions";

import { DarknodeCounts } from "../../lib/ethereum/contractReads";
import { getPrices, Token, TokenPrices } from "../../lib/ethereum/tokens";
import { _catchBackgroundException_ } from "../../lib/react/errors";
import { AppDispatch } from "../rootReducer";

export const storeTokenPrices = createAction("STORE_TOKEN_PRICES")<TokenPrices>();

export const updateCurrentCycle = createAction("UPDATE_CURRENT_CYCLE")<string>();
export const updatePreviousCycle = createAction("UPDATE_PREVIOUS_CYCLE")<string>();

export const updatePendingRewards = createAction("UPDATE_PENDING_REWARDS")<OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>>();
export const updatePendingTotalInEth = createAction("UPDATE_PENDING_TOTAL_IN_ETH")<OrderedMap<string /* cycle */, BigNumber>>();
export const updatePendingRewardsInEth = createAction("UPDATE_PENDING_REWARDS_IN_ETH")<OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>>();
export const updateCycleTimeout = createAction("UPDATE_CYCLE_TIMEOUT")<BigNumber>();
export const updateCurrentShareCount = createAction("UPDATE_CURRENT_SHARE_COUNT")<BigNumber>();
export const updateDarknodeCounts = createAction("UPDATE_DARKNODE_COUNTS")<DarknodeCounts>();

export const updateTokenPrices = () => async (dispatch: AppDispatch) => {
    try {
        const tokenPrices = await getPrices();
        dispatch(storeTokenPrices(tokenPrices));
    } catch (error) {
        _catchBackgroundException_(error, "Error in networkActions > updateTokenPrices");
    }
};
