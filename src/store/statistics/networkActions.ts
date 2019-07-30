import {} from "redux";

import { RenNetworkDetails } from "@renproject/contracts";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import { createStandardAction } from "typesafe-actions";
import Web3 from "web3";

import { DarknodeRegistryWeb3 } from "../../lib/ethereum/contracts/bindings/darknodeRegistry";
import { getPrices, Token } from "../../lib/ethereum/tokens";
import { TokenPrices } from "../../lib/tokenPrices";
import { AppDispatch } from "../rootReducer";

export const storeTokenPrices = createStandardAction("STORE_TOKEN_PRICES")<TokenPrices>();

export const storeMinimumBond = createStandardAction("STORE_MINIMUM_BOND")<BigNumber>();

export const updateCurrentCycle = createStandardAction("UPDATE_CURRENT_CYCLE")<string>();
export const updatePreviousCycle = createStandardAction("UPDATE_PREVIOUS_CYCLE")<string>();

export const updatePendingRewards = createStandardAction("UPDATE_PENDING_REWARDS")<OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>>();
export const updatePendingTotalInEth = createStandardAction("UPDATE_PENDING_TOTAL_IN_ETH")<OrderedMap<string /* cycle */, BigNumber>>();
export const updateCycleTimeout = createStandardAction("UPDATE_CYCLE_TIMEOUT")<BigNumber>();

export const updateNetworkStatistics = (web3: Web3, renNetwork: RenNetworkDetails) => async (dispatch: AppDispatch) => {
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodeRegistry.abi,
        renNetwork.addresses.ren.DarknodeRegistry.address
    );
    const minimumBondBN = await darknodeRegistry.methods.minimumBond().call();
    if (minimumBondBN) {
        const minimumBond = new BigNumber(minimumBondBN.toString());
        dispatch(storeMinimumBond(minimumBond));
    }
};

export const updateTokenPrices = () => async (dispatch: AppDispatch) => {
    const tokenPrices = await getPrices();
    dispatch(storeTokenPrices(tokenPrices));
};
