import * as Sentry from "@sentry/browser";
import * as React from "react";

import RenExSDK from "@renex/renex";
import Web3 from "web3";

import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";
import { provider } from "web3-providers";
import { toChecksumAddress } from "web3-utils";

import { LoggedOut } from "../../../components/popups/LoggedOut";
import { NoWeb3Popup } from "../../../components/popups/NoWeb3Popup";
import { Language } from "../../../languages/language";
import { _captureBackgroundException_ } from "../../../lib/errors";
import { getWeb3BrowserName, Web3Browser } from "../../../lib/ethereum/browsers";
import { getInjectedWeb3Provider } from "../../../lib/ethereum/wallet";
import { history } from "../../../lib/history";
import { readOnlyWeb3 } from "../../types";
import { clearPopup, setPopup } from "../popup/popupActions";

export const storeAddress = createStandardAction("storeAddress")<string | null>();
export const storeWeb3 = createStandardAction("storeWeb3")<Web3>();

export const storeWeb3BrowserName = createStandardAction("storeWeb3BrowserName")<Web3Browser>();

export const updateWeb3BrowserName = (
    newProvider: provider,
) => (dispatch: Dispatch) => {
    /*
    // Check for mobile
    const { userAgent: ua } = navigator
    const isIOS = ua.includes('iPhone') // “iPhone OS”
    const isAndroid = ua.includes('Android')
    */

    const web3BrowserName = getWeb3BrowserName(newProvider);

    dispatch(storeWeb3BrowserName(web3BrowserName));
};

export const login = (
    sdk: RenExSDK,
    options: { redirect: boolean; showPopup: boolean; immediatePopup: boolean },
) => async (dispatch: Dispatch) => {
    let cancelled = false;

    const onClick = async () => (login(sdk, { redirect: false, showPopup: true, immediatePopup: true })(dispatch));
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
            {
                popup: <NoWeb3Popup onConnect={onClick} onCancel={onCancel} disabled={true} message={promptMessage} />,
                onCancel,
                overlay: true,
            },
        ));
    }

    // Show popup if getInjectedWeb3Provider doesn't return immediately, since
    // the Web3 browser is probably prompting the user to approve access
    const timeout = setTimeout(() => {
        if (options.showPopup && !cancelled) {
            dispatch(setPopup(
                {
                    popup: <NoWeb3Popup onConnect={onClick} onCancel={onCancel} message={promptMessage} />,
                    onCancel,
                    overlay: true,
                },
            ));
        }
    }, 5 * 1000);

    let newProvider;
    let newWeb3;
    try {

        // Even if the provider is on the wrong network, etc., we can still
        // detect the browser name (MetaMask, Status, etc.)
        const onAnyProvider = (anyProvider: provider) => {
            updateWeb3BrowserName(anyProvider)(dispatch);
        };

        newProvider = await getInjectedWeb3Provider(onAnyProvider);
        newWeb3 = new Web3(newProvider);
    } catch (error) {
        clearTimeout(timeout);
        if (options.showPopup && !cancelled) {
            dispatch(setPopup(
                {
                    popup: <NoWeb3Popup onConnect={onClick} onCancel={onCancel} message={error.message} />,
                    onCancel,
                    overlay: true,
                },
            ));
        }
        return;
    }

    clearTimeout(timeout);

    const accounts = await newWeb3.eth.getAccounts();

    if (accounts.length === 0) {
        return;
    }

    dispatch(clearPopup());

    // For now we use first account
    // TODO: Add support for selecting other accounts other than first
    const address = toChecksumAddress(accounts[0].toLowerCase());

    Sentry.configureScope((scope) => {
        // scope.setUser({ id: address });
        scope.setExtra("loggedIn", true);
    });

    // Store address in the store (and in local storage)
    dispatch(storeAddress(address));
    dispatch(storeWeb3(newWeb3));

    // Configure SDK
    sdk.updateProvider(newProvider);
    sdk.setAddress(address);

    /*
    // Check for mobile
    const { userAgent: ua } = navigator
    const isIOS = ua.includes('iPhone') // “iPhone OS”
    const isAndroid = ua.includes('Android')
    */

    const web3BrowserName = getWeb3BrowserName(newProvider);

    dispatch(storeWeb3BrowserName(web3BrowserName));

    if (options.redirect) {
        // Navigate to the Exchange page
        history.push("/home");
    }
};

export const logout = (
    sdk: RenExSDK,
    options: { reload: boolean },
) => async (dispatch: Dispatch) => {

    // Clear session account in store (and in local storage)
    dispatch(storeAddress(null));
    dispatch(storeWeb3(readOnlyWeb3));

    // Use read-only provider and clear address
    sdk.updateProvider(readOnlyWeb3.currentProvider);
    sdk.setAddress("");

    Sentry.configureScope((scope) => {
        scope.setExtra("loggedIn", false);
    });

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
export const lookForLogout = (
    sdk: RenExSDK,
    address: string,
    web3: Web3,
) => async (dispatch: Dispatch) => {
    const sdkAddress = sdk.getAddress();

    if (!address && !sdkAddress) {
        return;
    }

    const accounts = (await web3.eth.getAccounts())
        .map((web3Address: string) => web3Address.toLowerCase());

    if (address.toLowerCase() !== sdkAddress.toLowerCase() || !accounts.includes(sdkAddress.toLowerCase())) {
        // console.error(`User has logged out of their web3 provider (${sdkAddress} not in [${accounts.join(", ")}])`);

        const onClick = async () => {
            await logout(sdk, { reload: true })(dispatch).catch((error) => {
                _captureBackgroundException_(error, {
                    description: "Error in logout in accountActions",
                });
            });
            await login(sdk, { redirect: false, showPopup: true, immediatePopup: false })(dispatch);
        };
        const onCancel = async () => {
            await logout(sdk, { reload: true })(dispatch).catch((error) => {
                _captureBackgroundException_(error, {
                    description: "Error in logout in accountActions",
                });
            });
            dispatch(clearPopup());
        };

        dispatch(
            setPopup(
                {
                    popup: <LoggedOut
                        onConnect={onClick}
                        onCancel={onCancel}
                        newAddress={accounts.length > 0 ? accounts[0] : null}
                    />,
                    onCancel,
                    dismissible: false,
                    overlay: true,
                },
            ),
        );
    }
};
