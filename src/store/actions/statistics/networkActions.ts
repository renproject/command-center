import { RenNetworkDetails } from "@renproject/contracts";
import BigNumber from "bignumber.js";
import { OrderedMap } from "immutable";
import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";
import Web3 from "web3";

import { DarknodeRegistryWeb3 } from "../../../lib/ethereum/contracts/bindings/darknodeRegistry";
import { getPrices, Token } from "../../../lib/ethereum/tokens";
import { TokenPrices } from "../../types";

export const storeTokenPrices = createStandardAction("storeTokenPrices")<TokenPrices>();

export const storeMinimumBond = createStandardAction("storeMinimumBond")<BigNumber>();

export const updateCurrentCycle = createStandardAction("updateCurrentCycle")<string>();
export const updatePreviousCycle = createStandardAction("updatePreviousCycle")<string>();

export const updatePendingRewards = createStandardAction("updatePendingRewards")<OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>>();
export const updatePendingTotalInEth = createStandardAction("updatePendingTotalInEth")<OrderedMap<string /* cycle */, BigNumber>>();
export const updateCycleTimeout = createStandardAction("updateCycleTimeout")<BigNumber>();

export const updateNetworkStatistics = (web3: Web3, renNetwork: RenNetworkDetails) => async (dispatch: Dispatch) => {
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

export const updateTokenPrices = () => async (dispatch: Dispatch) => {
    const tokenPrices = await getPrices();
    dispatch(storeTokenPrices(tokenPrices));
};
