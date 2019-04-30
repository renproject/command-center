import BigNumber from "bignumber.js";
import Web3 from "web3";

import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { DarknodeRegistryWeb3 } from "../../../lib/ethereum/contracts/bindings/darknodeRegistry";
import { contracts } from "../../../lib/ethereum/contracts/contracts";
import { getPrices } from "../../../lib/ethereum/tokens";
import { TokenPrices } from "../../types";

export const storeTokenPrices = createStandardAction("storeTokenPrices")<{ tokenPrices: TokenPrices }>();

export const storeMinimumBond = createStandardAction("storeMinimumBond")<{ minimumBond: BigNumber }>();

export const updateNetworkStatistics = (web3: Web3) => async (dispatch: Dispatch) => {
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );
    const minimumBond = new BigNumber((await darknodeRegistry.methods.minimumBond().call()).toString());
    dispatch(storeMinimumBond({ minimumBond }));
};

export const updateTokenPrices = () => async (dispatch: Dispatch) => {
    const tokenPrices = await getPrices();
    dispatch(storeTokenPrices({ tokenPrices }));
};
