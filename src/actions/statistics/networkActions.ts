import RenExSDK from "@renex/renex";
import BigNumber from "bignumber.js";

import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { getPrices } from "../../lib/tokens";
import { TokenPrices } from "../../reducers/types";

export const storeTokenPrices = createStandardAction("STORE_TOKEN_PRICES")<{ tokenPrices: TokenPrices; }>();

export const storeMinimumBond = createStandardAction("STORE_MINIMUM_BOND")<{ minimumBond: BigNumber; }>();

export const updateNetworkStatistics = (sdk: RenExSDK) => async (dispatch: Dispatch) => {
    const minimumBond = new BigNumber(await sdk._contracts.darknodeRegistry.minimumBond());
    dispatch(storeMinimumBond({ minimumBond }));
};

export const updateTokenPrices = () => async (dispatch: Dispatch) => {
    const tokenPrices = await getPrices();
    dispatch(storeTokenPrices({ tokenPrices }));
};
