import * as Sentry from "@sentry/browser";
import * as React from "react";

import { RenNetworkDetails } from "@renproject/contracts";
import { createStandardAction } from "typesafe-actions";
import Web3 from "web3";
import { provider } from "web3-providers";
import { toChecksumAddress } from "web3-utils";

import { LoggedOut } from "../../components/common/popups/LoggedOut";
import { NoWeb3Popup } from "../../components/common/popups/NoWeb3Popup";
import { Language } from "../../languages/language";
import { getInjectedWeb3Provider } from "../../lib/ethereum/getWeb3";
import { history } from "../../lib/react/history";
import { ApplicationState } from "../applicationState";
import { clearPopup, setPopup } from "../popup/popupActions";
import { AppDispatch } from "../rootReducer";

export const logout = createStandardAction("LOGOUT")();
export const login = createStandardAction("LOGIN")<{ web3: Web3, address: string }>();
export const storeRenNetwork = createStandardAction("STORE_REN_NETWORK")<RenNetworkDetails>();

export const storeWeb3BrowserName = createStandardAction("STORE_WEB3_BROWSER_NAME")<provider>();

export const promptLogin = (
    renNetwork: RenNetworkDetails,
    options: { redirect: boolean; showPopup: boolean; immediatePopup: boolean },
) => async (dispatch: AppDispatch) => {
    let cancelled = false;

    const onClick = async () => (dispatch(promptLogin(renNetwork, { redirect: false, showPopup: true, immediatePopup: true })));
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
                popup: <NoWeb3Popup onConnect={onClick} onCancel={onCancel} message={promptMessage} disabled />,
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
            dispatch(storeWeb3BrowserName(anyProvider));
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

    // tslint:disable-next-line: no-any
    const network = (await (newWeb3.eth.net as any).getNetworkType());

    if (network !== renNetwork.chain) {
        if (options.showPopup && !cancelled) {
            dispatch(setPopup(
                {
                    popup: <NoWeb3Popup onConnect={onClick} onCancel={onCancel} message={`Please change your network to ${renNetwork.chainLabel}`} />,
                    onCancel,
                    overlay: true,
                },
            ));
        }
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
    dispatch(login({ web3: newWeb3, address }));

    /*
    // Check for mobile
    const { userAgent: ua } = navigator
    const isIOS = ua.includes('iPhone') // “iPhone OS”
    const isAndroid = ua.includes('Android')
    */

    dispatch(storeWeb3BrowserName(newProvider));

    if (options.redirect) {
        // Navigate to the Exchange page
        history.push("/home");
    }
};

// lookForLogout detects if 1) the user has changed or logged out of their Web3
// wallet
export const lookForLogout = () => async (dispatch: AppDispatch, getState: () => ApplicationState) => {
    const { renNetwork, address, web3 } = getState().account;

    if (!address) {
        return;
    }

    const accounts = (await web3.eth.getAccounts())
        .map((web3Address: string) => web3Address.toLowerCase());

    if (!accounts.includes(address.toLowerCase())) {
        const onClick = async () => {
            dispatch(logout());
            await dispatch(promptLogin(renNetwork, { redirect: false, showPopup: true, immediatePopup: false }));
        };
        const onCancel = async () => {
            dispatch(logout());
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
