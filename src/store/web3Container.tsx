import * as Sentry from "@sentry/browser";

import {
    renMainnet,
    RenNetwork,
    RenNetworkDetails,
    renTestnet,
} from "@renproject/contracts";
import Onboard from "bnc-onboard";
import { API } from "bnc-onboard/dist/src/interfaces";
import React, { useEffect, useState } from "react";
import { createContainer } from "unstated-next";
import Web3 from "web3";
import { toChecksumAddress } from "web3-utils";

import { LoggedOut } from "../controllers/common/popups/LoggedOut";
import { getWeb3BrowserName, Web3Browser } from "../lib/ethereum/browsers";
import { getReadOnlyWeb3 } from "../lib/ethereum/getWeb3";
import {
    BLOCKNATIVE_INFURA_KEY,
    BLOCKNATIVE_KEY,
    INFURA_KEY,
} from "../lib/react/environmentVariables";
import { PopupContainer } from "./popupContainer";
import useStorageState from "./useStorageState/useStorageState";

const stringToNetwork = (network: RenNetwork): RenNetworkDetails => {
    switch (network.toLowerCase()) {
        case RenNetwork.Mainnet:
            return renMainnet;
        case RenNetwork.Testnet:
            return renTestnet;
    }
    throw new Error(`Unknown network ${network}.`);
};

const useOnboard = (networkID: number) => {
    const [onboard, setOnboard] = useState<API | undefined>();

    useEffect(() => {
        setOnboard(
            Onboard({
                dappId: BLOCKNATIVE_KEY,
                networkId: networkID,
                darkMode: true,
                walletSelect: {
                    wallets: [
                        { walletName: "metamask" },
                        {
                            walletName: "walletConnect",
                            infuraKey: BLOCKNATIVE_INFURA_KEY,
                        },
                        {
                            walletName: "ledger",
                            rpcUrl: "https://" + networkID === 1 ? 'mainnet' : 'kovan' + `.infura.io/v3/${INFURA_KEY}`
                        }
                    ],
                },
                walletCheck: [
                    { checkName: "accounts" },
                    { checkName: "connect" },
                    { checkName: "network" },
                ],
            }),
        );
    }, [networkID]);

    return { onboard };
};

const useWeb3Container = (initialState = RenNetwork.Testnet) => {
    const { setPopup, clearPopup } = PopupContainer.useContainer();

    const [renNetwork] = useState<RenNetworkDetails>(
        stringToNetwork(initialState),
    );
    const { onboard } = useOnboard(renNetwork.networkID);

    const rpcUrl = `${renNetwork.infura}/v3/${INFURA_KEY}`;
    const [readonlyWeb3] = useState<Web3>(getReadOnlyWeb3(rpcUrl));
    const [web3, setWeb3] = useState<Web3>(readonlyWeb3);

    // Login data
    const [address, setAddress] = useState<string | null>(null);
    const [web3BrowserName, setWeb3BrowserName] = useState(
        Web3Browser.Web3Browser,
    );

    // The following are almost opposites - except that they are both
    // initialized as false. LoggedInBefore means that we try to re-login again
    // when the page is loaded. Logged out means that we don't try to re-login.
    const [loggedInBefore, setLoggedInBefore] = useStorageState(
        localStorage,
        "loggedInBefore",
        false,
    );
    const [loggedOut, setLoggedOut] = useState(false);

    const logout = () => {
        setWeb3(readonlyWeb3);
        setAddress(null);
        setLoggedOut(true);
        setLoggedInBefore(false);

        if (onboard) {
            onboard.walletReset();
        }
    };

    const login = ({
        newWeb3,
        newAddress,
    }: {
        newWeb3: Web3;
        newAddress: string;
    }) => {
        setAddress(newAddress);
        setWeb3(newWeb3);
        setLoggedOut(false);
        setLoggedInBefore(true);
    };

    const promptLogin = async (options: { manual: boolean }) => {
        if ((loggedOut && !options.manual) || !onboard) {
            return;
        }

        const walletSelected = await onboard.walletSelect();

        if (!walletSelected) {
            return;
        }

        const walletChecked = await onboard.walletCheck();

        if (!walletChecked) {
            return;
        }

        const newWeb3 = new Web3(onboard.getState().wallet.provider);

        // For now we use first account
        const defaultAddress = toChecksumAddress(onboard.getState().address);

        Sentry.configureScope((scope) => {
            // scope.setUser({ id: address });
            scope.setExtra("loggedIn", true);
        });

        // Store address in the store (and in local storage)
        login({ newWeb3, newAddress: defaultAddress });

        const newWeb3BrowserName = getWeb3BrowserName(newWeb3.currentProvider);
        setWeb3BrowserName(newWeb3BrowserName);

        return defaultAddress;
    };

    // lookForLogout detects if 1) the user has changed or logged out of their Web3
    // wallet
    const lookForLogout = async () => {
        if (!address) {
            return;
        }

        const accounts = (
            await web3.eth.getAccounts()
        ).map((web3Address: string) => web3Address.toLowerCase());

        if (!accounts.includes(address.toLowerCase())) {
            const onClick = async () => {
                setAddress(accounts[0]);
                clearPopup();
            };
            const onCancel = async () => {
                logout();
                clearPopup();
            };

            setPopup({
                popup: (
                    <LoggedOut
                        onConnect={onClick}
                        onCancel={onCancel}
                        newAddress={accounts.length > 0 ? accounts[0] : null}
                    />
                ),
                onCancel,
                dismissible: false,
                overlay: true,
            });
        }
    };

    return {
        renNetwork,
        web3,
        setWeb3,
        address,
        setAddress,
        web3BrowserName,
        setWeb3BrowserName,
        loggedInBefore,
        setLoggedInBefore,
        loggedOut,
        setLoggedOut,

        logout,
        promptLogin,
        lookForLogout,
    };
};

export const Web3Container = createContainer(useWeb3Container);
