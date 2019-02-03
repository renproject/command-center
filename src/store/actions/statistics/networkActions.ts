import RenExSDK from "@renex/renex";
import BigNumber from "bignumber.js";

import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { contracts } from "../../../lib/ethereum/contracts/contracts";
import { getPrices } from "../../../lib/ethereum/tokens";
import { TokenPrices } from "../../types";

export const storeTokenPrices = createStandardAction("STORE_TOKEN_PRICES")<{ tokenPrices: TokenPrices }>();

export const storeMinimumBond = createStandardAction("STORE_MINIMUM_BOND")<{ minimumBond: BigNumber }>();

export const updateNetworkStatistics = (sdk: RenExSDK) => async (dispatch: Dispatch) => {
    const darknodeRegistry = new ((sdk.getWeb3()).eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );
    const minimumBond = new BigNumber(await darknodeRegistry.methods.minimumBond().call());
    dispatch(storeMinimumBond({ minimumBond }));
};

export const updateTokenPrices = () => async (dispatch: Dispatch) => {
    const tokenPrices = await getPrices();
    dispatch(storeTokenPrices({ tokenPrices }));
};
