import * as Sentry from "@sentry/browser";

import { RenNetworkDetails, testnet } from "@renproject/contracts";
import React, { useState } from "react";
import { createContainer } from "unstated-next";
import Web3 from "web3";
import { provider } from "web3-providers";
import { toChecksumAddress } from "web3-utils";

import { LoggedOut } from "../components/common/popups/LoggedOut";
import { NoWeb3Popup } from "../components/common/popups/NoWeb3Popup";
import { Language } from "../languages/language";
import { getWeb3BrowserName, Web3Browser } from "../lib/ethereum/browsers";
import { getInjectedWeb3Provider, getReadOnlyWeb3 } from "../lib/ethereum/getWeb3";
import { INFURA_KEY } from "../lib/react/environmentVariables";
import { history } from "../lib/react/history";
import { PopupContainer } from "./popupStore";
import useStorageState from "./useStorageState/useStorageState";

const useWeb3Container = (initialState = testnet as RenNetworkDetails) => {
    const { setPopup, clearPopup } = PopupContainer.useContainer();

    const [renNetwork, setRenNetwork] = useStorageState<RenNetworkDetails>(localStorage, "renNetwork", initialState);

    const [readonlyWeb3,] = useState<Web3>(getReadOnlyWeb3(`${renNetwork.infura}/v3/${INFURA_KEY}`));
    const [web3, setWeb3] = useState<Web3>(readonlyWeb3);

    // Login data
    const [address, setAddress] = useState<string | null>(null);
    const [web3BrowserName, setWeb3BrowserName] = useState(Web3Browser.MetaMask);

    // The following are almost opposites - except that they are both
    // initialized as false. LoggedInBefore means that we try to re-login again
    // when the page is loaded. Logged out means that we don't try to re-login.
    const [loggedInBefore, setLoggedInBefore] = useStorageState(localStorage, "loggedInBefore", false);
    const [loggedOut, setLoggedOut] = useState(false);

    const logout = () => {
        setWeb3(readonlyWeb3);
        setAddress(null);
        setLoggedOut(true);
        setLoggedInBefore(false);
    };

    const login = ({ newWeb3, newAddress }: { newWeb3: Web3, newAddress: string }) => {
        setAddress(newAddress);
        setWeb3(newWeb3);
        setLoggedInBefore(true);
    };

    const promptLogin = async (
        options: { manual: boolean, redirect: boolean; showPopup: boolean; immediatePopup: boolean },
    ) => {
        let cancelled = false;


        if (loggedOut && !options.manual) {
            return;
        }

        const onClick = async () => (promptLogin({ manual: true, redirect: false, showPopup: true, immediatePopup: true }));
        const onCancel = () => {
            clearPopup();
            cancelled = true;
        };

        let promptMessage: string | undefined;
        try {
            // tslint:disable-next-line:no-any
            const ethereum = (window as any).ethereum;
            if (ethereum && ethereum._metamask) {
                if (ethereum._metamask.isUnlocked && !(await ethereum._metamask.isUnlocked())) {
                    promptMessage = Language.wallet.mustUnlock;
                } else if ((ethereum._metamask.isApproved && !(await ethereum._metamask.isApproved()))) {
                    promptMessage = Language.wallet.mustConnect;
                }
            }
        } catch (error) {
            // ignore error
        }

        if (options.showPopup && options.immediatePopup) {
            setPopup(
                {
                    popup: <NoWeb3Popup onConnect={onClick} onCancel={onCancel} message={promptMessage} disabled />,
                    onCancel,
                    overlay: true,
                },
            );
        }

        // Show popup if getInjectedWeb3Provider doesn't return immediately, since
        // the Web3 browser is probably prompting the user to approve access
        const timeout = setTimeout(() => {
            if (options.showPopup && !cancelled) {
                setPopup(
                    {
                        popup: <NoWeb3Popup onConnect={onClick} onCancel={onCancel} message={promptMessage} />,
                        onCancel,
                        overlay: true,
                    },
                );
            }
        }, 5 * 1000);

        let newProvider;
        let newWeb3;
        try {

            // Even if the provider is on the wrong network, etc., we can still
            // detect the browser name (MetaMask, Status, etc.)
            const onAnyProvider = (anyProvider: provider) => {
                const anyWeb3BrowserName = getWeb3BrowserName(anyProvider);
                setWeb3BrowserName(anyWeb3BrowserName);
            };

            newProvider = await getInjectedWeb3Provider(onAnyProvider);
            newWeb3 = new Web3(newProvider);
        } catch (error) {
            clearTimeout(timeout);
            if (options.showPopup && !cancelled) {
                setPopup(
                    {
                        popup: <NoWeb3Popup onConnect={onClick} onCancel={onCancel} message={error.message} />,
                        onCancel,
                        overlay: true,
                    },
                );
            }
            return;
        }

        clearTimeout(timeout);

        const accounts = await newWeb3.eth.getAccounts();

        if (accounts.length === 0) {
            return;
        }

        const network = (await newWeb3.eth.net.getNetworkType());

        if (network !== renNetwork.chain) {
            if (options.showPopup && !cancelled) {
                setPopup(
                    {
                        popup: <NoWeb3Popup onConnect={onClick} onCancel={onCancel} message={`Please change your network to ${renNetwork.chainLabel}`} />,
                        onCancel,
                        overlay: true,
                    },
                );
            }
            return;
        }

        clearPopup();

        // For now we use first account
        // TODO: Add support for selecting other accounts other than first
        const defaultAddress = toChecksumAddress(accounts[0].toLowerCase());

        Sentry.configureScope((scope) => {
            // scope.setUser({ id: address });
            scope.setExtra("loggedIn", true);
        });

        // Store address in the store (and in local storage)
        login({ newWeb3, newAddress: defaultAddress });

        /*
        // Check for mobile
        const { userAgent: ua } = navigator
        const isIOS = ua.includes('iPhone') // “iPhone OS”
        const isAndroid = ua.includes('Android')
        */

        const newWeb3BrowserName = getWeb3BrowserName(newProvider);
        setWeb3BrowserName(newWeb3BrowserName);

        if (options.redirect) {
            // Navigate to the Exchange page
            history.push("/home");
        }
    };

    // lookForLogout detects if 1) the user has changed or logged out of their Web3
    // wallet
    const lookForLogout = async (
    ) => {
        if (!address) {
            return;
        }

        const accounts = (await web3.eth.getAccounts())
            .map((web3Address: string) => web3Address.toLowerCase());

        if (!accounts.includes(address.toLowerCase())) {
            const onClick = async () => {
                logout();
                await promptLogin({ manual: true, redirect: false, showPopup: true, immediatePopup: false });
            };
            const onCancel = async () => {
                logout();
                clearPopup();
            };

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
            );
        }
    };

    return {
        renNetwork, web3, setWeb3, setRenNetwork, address, setAddress,
        web3BrowserName, setWeb3BrowserName, loggedInBefore, setLoggedInBefore,
        loggedOut, setLoggedOut,

        logout, promptLogin, lookForLogout,
    };
};

export const Web3Container = createContainer(useWeb3Container);
