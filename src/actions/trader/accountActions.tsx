import * as React from "react";

import RenExSDK from "@renex/renex";
import Web3 from "web3";

import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { history } from "@Library/history";

import { clearPopup, setPopup } from "@Actions/popup/popupActions";
import { clearDarknodeList, updateOperatorStatistics } from "@Actions/statistics/operatorActions";
import { storeWallet } from "@Actions/trader/walletActions";
import { LoggedOut } from "@Components/popups/LoggedOut";
import { NoMetaMask } from "@Components/popups/NoMetaMask";
import { networkData } from "@Library/network";
import { getInjectedWeb3Provider } from "@Library/wallets/web3browser";
import { getAccounts, getNetwork } from "@Library/web3";

interface StoreSDKPayload { sdk: RenExSDK | null; }
export type StoreSDKAction = (payload: StoreSDKPayload) => void;
export const storeSDK = createStandardAction("STORE_SDK")<StoreSDKPayload>();

type StoreAddressPayload = string | null;
export type StoreAddressAction = (payload: StoreAddressPayload) => void;
export const storeAddress = createStandardAction("STORE_ADDRESS")<StoreAddressPayload>();

export type LoginAction = (options: { redirect: boolean }) => (dispatch: Dispatch) => Promise<void>;
export const login: LoginAction = (options) => async (dispatch) => {

    const onClick = () => login({ redirect: false })(dispatch);
    const onCancel = () => {
        dispatch(clearPopup());
    };

    // Show popup if getInjectedWeb3Provider doesn't return immediately
    const timeout = setTimeout(() => {
        dispatch(
            setPopup(
                { popup: <NoMetaMask onConnect={onClick} onCancel={onCancel} />, onCancel }
            ));
    }, 200);


    let provider;
    try {
        provider = await getInjectedWeb3Provider();
    } catch (error) {
        // Injected Web3 request was denied
        return;
    }

    clearTimeout(timeout);

    const accounts = await getAccounts(new Web3(provider));

    if (accounts.length === 0) {
        return;
    }

    dispatch(clearPopup());

    // For now we use first account
    // TODO: Add support for selecting other accounts other than first
    const address = accounts[0];

    // These are repeated in login, but the page will log-out if the
    // address is not available immediately

    // Check that the provider is using the correct network
    if (await getNetwork(new Web3(provider)) !== networkData.ethNetwork) {
        // dispatch(setAlert({
        //     alert: new Alert({ message: `Invalid Web3 network (expected ${networkData.ethNetworkLabel})` })
        // }));

        logout({ reload: false })(dispatch).catch(console.error);
        return;
    }

    const sdk = new RenExSDK(provider, { network: "testnet" });
    dispatch(storeSDK({ sdk }));
    sdk.updateProvider(provider);
    sdk.setAddress(address);

    // Store address in the store (and in local storage)
    dispatch(storeAddress(address));

    updateOperatorStatistics(sdk)(dispatch)
        .catch(console.error);

    if (options.redirect) {
        // Navigate to the Exchange page
        // history.push("#/home");
        location.replace("#/home");
    }
};

export type LogoutAction = (options: { reload: boolean }) => (dispatch: Dispatch) => Promise<void>;
export const logout: LogoutAction = (options) => async (dispatch) => {

    // Clear session account in store (and in local storage)
    dispatch(storeAddress(null));

    // Clear Redux stores
    dispatch(storeWallet({ wallet: null }));

    // Use read-only provider and clear address
    dispatch(storeSDK({ sdk: null }));

    // Clear darknodes
    dispatch(clearDarknodeList());

    if (options.reload) {
        // history.push("/#/loading");
        // Reload to clear all stores and cancel timeouts
        // (e.g. deposit/withdrawal confirmations)
        location.replace("./#/");
    }
};

export type LookForLogoutAction = (sdk: RenExSDK) => (dispatch: Dispatch) => Promise<void>;
export const lookForLogout: LookForLogoutAction = (sdk) => async (dispatch) => {
    if (!sdk.getAddress()) {
        return;
    }

    const accounts = (await sdk.getWeb3().eth.getAccounts()).map((address) => address.toLowerCase());
    if (!accounts.includes(sdk.getAddress().toLowerCase())) {
        // console.error(`User has logged out of their web3 provider (${sdk.getAddress()} not in [${accounts.join(", ")}])`);

        const onClick = () => login({ redirect: false })(dispatch);
        const onCancel = () => {
            dispatch(clearPopup());
        };
        dispatch(
            setPopup(
                { popup: <LoggedOut onConnect={onClick} onCancel={onCancel} />, onCancel }
            )
        );

        logout({ reload: true })(dispatch).catch(console.error);
    }
};
