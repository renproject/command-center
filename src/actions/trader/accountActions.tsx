import * as React from "react";

import RenExSDK from "@renex/renex";
import Web3 from "web3";

import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";

import { history } from "../../lib/history";

import { clearPopup, setPopup } from "../../actions/popup/popupActions";
import { LoggedOut } from "../../components/popups/LoggedOut";
import { NoWeb3Popup } from "../../components/popups/NoWeb3Popup";
import { getInjectedWeb3Provider } from "../../lib/wallets/web3browser";
import { getAccounts } from "../../lib/web3";
import { Language } from "../../languages/language";
import { Provider } from "web3/providers";

export const storeAddress = createStandardAction("STORE_ADDRESS")<string | null>();

export const storeWeb3BrowserName = createStandardAction("STORE_WEB3_BROWSER_NAME")<string>();

export const login = (sdk: RenExSDK, options: { redirect: boolean, showPopup: boolean, immediatePopup: boolean }) => async (dispatch: Dispatch) => {
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
    const address = sdk.getWeb3().utils.toChecksumAddress(accounts[0].toLowerCase());

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

    if (options.redirect) {
        // Navigate to the Exchange page
        history.push("/home");
    }
};

export const logout = (sdk: RenExSDK, readOnlyProvider: Provider, options: { reload: boolean }) => async (dispatch: Dispatch) => {

    // Clear session account in store (and in local storage)
    dispatch(storeAddress(null));

    // Use read-only provider and clear address
    sdk.updateProvider(readOnlyProvider);
    sdk.setAddress("");

    if (options.reload) {
        // const currentLocation = location.pathname;
        // // history.push("/loading");
        // // Reload to clear all stores and cancel timeouts
        // // (e.g. deposit/withdrawal confirmations)
        // location.replace(currentLocation);
    }
};

// lookForLogout detects if 1) the user has changed or logged out of their Web3
// wallet, or if the SDK's selected address has been changed (this should not
// usually happen) 
export const lookForLogout = (sdk: RenExSDK, address: string, readOnlyProvider: Provider) => async (dispatch: Dispatch) => {
    const sdkAddress = sdk.getAddress();

    if (!address && !sdkAddress) {
        return;
    }

    const accounts = (await sdk.getWeb3().eth.getAccounts()).map((web3Address) => web3Address.toLowerCase());
    if (address.toLowerCase() !== sdkAddress.toLowerCase() || !accounts.includes(sdkAddress.toLowerCase())) {
        // console.error(`User has logged out of their web3 provider (${sdkAddress} not in [${accounts.join(", ")}])`);

        const onClick = async () => {
            await logout(sdk, readOnlyProvider, { reload: true })(dispatch).catch(console.error);
            await login(sdk, { redirect: false, showPopup: true, immediatePopup: false })(dispatch);
        };
        const onCancel = () => {
            dispatch(clearPopup());
        };

        dispatch(
            setPopup(
                { popup: <LoggedOut onConnect={onClick} onCancel={onCancel} newAddress={accounts.length > 0 ? accounts[0] : null} />, onCancel, dismissible: false, overlay: true }
            )
        );
    }
};
