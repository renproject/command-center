import RenExSDK from "@renex/renex";
import BigNumber from "bignumber.js";

import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { getPrices } from "@Library/tokens";
import { TokenPrices } from "@Reducers/types";

interface StoreTokenPricesPayload { tokenPrices: TokenPrices; }
export type StoreTokenPricesAction = (payload: StoreTokenPricesPayload) => void;
export const storeTokenPrices = createStandardAction("STORE_TOKEN_PRICES")<StoreTokenPricesPayload>();

interface StoreMinimumBondPayload { minimumBond: BigNumber; }
export type StoreMinimumBondAction = (payload: StoreMinimumBondPayload) => void;
export const storeMinimumBond = createStandardAction("STORE_MINIMUM_BOND")<StoreMinimumBondPayload>();

export type UpdateNetworkStatisticsAction = (sdk: RenExSDK) => (dispatch: Dispatch) => Promise<void>;
export const updateNetworkStatistics: UpdateNetworkStatisticsAction = (sdk) => async (dispatch) => {
    const minimumBond = new BigNumber(await sdk._contracts.darknodeRegistry.minimumBond());
    dispatch(storeMinimumBond({ minimumBond }));
};

export type UpdateTokenPricesAction = () => (dispatch: Dispatch) => Promise<void>;
export const updateTokenPrices: UpdateTokenPricesAction = () => async (dispatch) => {
    const tokenPrices = await getPrices();
    dispatch(storeTokenPrices({ tokenPrices }));
};

