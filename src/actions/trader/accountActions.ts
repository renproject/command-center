import RenExSDK from "renex-sdk-ts";
import Web3 from "web3";

import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import history from "@Library/history";

import { storeWallet } from "@Actions/trader/walletActions";
import { INFURA_URL, networkData } from "@Library/network";
import { getNetwork } from "@Library/web3";
import { Provider } from "web3/types";

interface StoreSDKPayload { sdk: RenExSDK; }
export type StoreSDKAction = (payload: StoreSDKPayload) => void;
export const storeSDK = createStandardAction("STORE_SDK")<StoreSDKPayload>();

type StoreAddressPayload = string | null;
export type StoreAddressAction = (payload: StoreAddressPayload) => void;
export const storeAddress = createStandardAction("STORE_ADDRESS")<StoreAddressPayload>();

export type LoginAction = (sdk: RenExSDK, web3Provider: Provider, address: string, options: { redirect: boolean }) => (dispatch: Dispatch) => Promise<void>;
export const login: LoginAction = (sdk, web3Provider, address, options) => async (dispatch) => {
    // Check that the provider is using the correct network
    if (await getNetwork(new Web3(web3Provider)) !== networkData.ethNetwork) {
        // dispatch(setAlert({
        //     alert: new Alert({ message: `Invalid Web3 network (expected ${networkData.ethNetworkLabel})` })
        // }));

        logout(sdk, { reload: false })(dispatch).catch(console.error);
        return;
    }
    // Store address in the store (and in local storage)
    dispatch(storeAddress(address));

    // Configure SDK
    sdk.updateProvider(web3Provider);
    sdk.updateAddress(address);

    if (options.redirect) {
        // Navigate to the Exchange page
        // history.push("#/home");
        location.replace("#/home");
    }
};

export type LogoutAction = (sdk: RenExSDK, options: { reload: boolean }) => (dispatch: Dispatch) => Promise<void>;
export const logout: LogoutAction = (sdk, options) => async (dispatch) => {

    // Clear session account in store (and in local storage)
    dispatch(storeAddress(null));

    // Clear Redux stores
    dispatch(storeWallet({ wallet: null }));

    // Use read-only provider and clear address
    sdk.updateProvider(new Web3.providers.HttpProvider(INFURA_URL));
    sdk.updateAddress("");

    if (options.reload) {
        // history.push("/#/loading");
        // Reload to clear all stores and cancel timeouts
        // (e.g. deposit/withdrawal confirmations)
        location.replace("./#/");
    }
};

export type LookForLogoutAction = (sdk: RenExSDK) => (dispatch: Dispatch) => Promise<void>;
export const lookForLogout: LookForLogoutAction = (sdk) => async (dispatch) => {
    if (!sdk.address()) {
        return;
    }

    const accounts = (await sdk.web3().eth.getAccounts()).map((address) => address.toLowerCase());
    if (!accounts.includes(sdk.address().toLowerCase())) {
        console.error(`User has logged out of their web3 provider (${sdk.address()} not in [${accounts.join(", ")}])`);
        logout(sdk, { reload: true })(dispatch).catch(console.error);
    }
};
