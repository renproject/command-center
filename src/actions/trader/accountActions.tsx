import * as React from "react";

import RenExSDK from "@renex/renex";
import Web3 from "web3";

import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { history } from "@Library/history";

import { clearPopup, setPopup } from "@Actions/popup/popupActions";
import { clearDarknodeList, updateOperatorStatistics } from "@Actions/statistics/operatorActions";
import { LoggedOut } from "@Components/popups/LoggedOut";
import { NoWeb3Popup } from "@Components/popups/NoWeb3Popup";
import { getInjectedWeb3Provider } from "@Library/wallets/web3browser";
import { getAccounts } from "@Library/web3";
import { Language } from "@Root/languages/language";
import { Provider } from "web3/providers";

type StoreAddressPayload = string | null;
export type StoreAddressAction = (payload: StoreAddressPayload) => void;
export const storeAddress = createStandardAction("STORE_ADDRESS")<StoreAddressPayload>();

type StoreWeb3BrowserNamePayload = string;
export type StoreWeb3BrowserNameAction = (payload: StoreWeb3BrowserNamePayload) => void;
export const storeWeb3BrowserName = createStandardAction("STORE_WEB3_BROWSER_NAME")<StoreWeb3BrowserNamePayload>();

export type LoginAction = (sdk: RenExSDK, options: { redirect: boolean, showPopup: boolean, immediatePopup: boolean }) => (dispatch: Dispatch) => Promise<void>;
export const login: LoginAction = (sdk, options) => async (dispatch) => {

    let cancelled = false;

    const onClick = () => (login(sdk, { redirect: false, showPopup: true, immediatePopup: true })(dispatch));
    const onCancel = () => {
        dispatch(clearPopup());
        cancelled = true;
    };

    let promptMessage: string | undefined;
    try {
        // tslint:disable-next-line:no-any
        const ethereum = (window as any).ethereum;
        if (ethereum && ethereum._metamask) {
            if (ethereum._metamask.isUnlocked && !(await ethereum._metamask.isUnlocked())) {
                promptMessage = Language.wallet.mustUnlock;
            } else if (ethereum._metamask.isApproved && !(await ethereum._metamask.isApproved())) {
                promptMessage = Language.wallet.mustConnect;
            }
        }
    } catch (error) {
        // ignore error
    }

    if (options.showPopup && options.immediatePopup) {
        dispatch(setPopup(
            { popup: <NoWeb3Popup onConnect={onClick} onCancel={onCancel} disabled={true} message={promptMessage} />, onCancel }
        ));
    }

    // Show popup if getInjectedWeb3Provider doesn't return immediately, since
    // the Web3 browser is probably prompting the user to approve access
    const timeout = setTimeout(() => {
        if (options.showPopup && !cancelled) {
            dispatch(setPopup(
                { popup: <NoWeb3Popup onConnect={onClick} onCancel={onCancel} message={promptMessage} />, onCancel }
            ));
        }
    }, 5 * 1000);


    let provider;
    try {
        provider = await getInjectedWeb3Provider();
    } catch (error) {
        clearTimeout(timeout);
        if (options.showPopup && !cancelled) {
            dispatch(setPopup(
                { popup: <NoWeb3Popup onConnect={onClick} onCancel={onCancel} message={error.message} />, onCancel }
            ));
        }
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

    sdk.updateProvider(provider);
    sdk.setAddress(address);

    // Store address in the store (and in local storage)
    dispatch(storeAddress(address));


    /*
    // Check for mobile
    const { userAgent: ua } = navigator
    const isIOS = ua.includes('iPhone') // “iPhone OS”
    const isAndroid = ua.includes('Android')
    */

    // Check for web3 enabled browsers
    let web3BrowserName = "Web3 Browser";
    // tslint:disable:no-any
    if ((provider as any).isToshi) {
        // Toshi has become Coinbase wallet
        web3BrowserName = "Coinbase Wallet";
    } else if ((provider as any).isCipher) {
        web3BrowserName = "Cipher";
    } else if ((provider as any).isStatus) {
        web3BrowserName = "Status";
    } else if ((provider as any).isTrust) {
        web3BrowserName = "Trust";
    } else if ((provider as any).isMetaMask) {
        web3BrowserName = "MetaMask";
    } else if ((window as any).mist) {
        web3BrowserName = "Mist"; // Not tested
    }
    // tslint:enable:no-any

    dispatch(storeWeb3BrowserName(web3BrowserName));

    updateOperatorStatistics(sdk)(dispatch)
        .catch(console.error);

    if (options.redirect) {
        // Navigate to the Exchange page
        // history.push("#/home");
        location.replace("#/home");
    }
};

export type LogoutAction = (sdk: RenExSDK, readOnlyProvider: Provider, options: { reload: boolean }) => (dispatch: Dispatch) => Promise<void>;
export const logout: LogoutAction = (sdk, readOnlyProvider, options) => async (dispatch) => {

    // Clear session account in store (and in local storage)
    dispatch(storeAddress(null));

    // Use read-only provider and clear address
    sdk.updateProvider(readOnlyProvider);
    sdk.setAddress("");

    // Clear darknodes
    dispatch(clearDarknodeList());

    if (options.reload) {
        // history.push("/#/loading");
        // Reload to clear all stores and cancel timeouts
        // (e.g. deposit/withdrawal confirmations)
        location.replace("./#/");
    }
};

export type LookForLogoutAction = (sdk: RenExSDK, readOnlyProvider: Provider) => (dispatch: Dispatch) => Promise<void>;
export const lookForLogout: LookForLogoutAction = (sdk, readOnlyProvider) => async (dispatch) => {
    if (!sdk.getAddress()) {
        return;
    }

    const accounts = (await sdk.getWeb3().eth.getAccounts()).map((address) => address.toLowerCase());
    if (!accounts.includes(sdk.getAddress().toLowerCase())) {
        // console.error(`User has logged out of their web3 provider (${sdk.getAddress()} not in [${accounts.join(", ")}])`);

        const onClick = async () => {
            await login(sdk, { redirect: false, showPopup: true, immediatePopup: false })(dispatch);
        };
        const onCancel = () => {
            dispatch(clearPopup());
        };

        await logout(sdk, readOnlyProvider, { reload: false })(dispatch).catch(console.error);

        dispatch(
            setPopup(
                { popup: <LoggedOut onConnect={onClick} onCancel={onCancel} newAddress={accounts.length > 0 ? accounts[0] : null} />, onCancel }
            )
        );
    }
};
