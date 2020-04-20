import { RenNetworkDetails, testnet } from "@renproject/contracts";
import { useState } from "react";
import { createContainer } from "unstated-next";
import Web3 from "web3";

import { Web3Browser } from "../lib/ethereum/browsers";
import { readOnlyWeb3 } from "./applicationState";

const useWeb3Container = (initialState = testnet as RenNetworkDetails) => {
    const [renNetwork, setRenNetwork] = useState<RenNetworkDetails>(initialState);
    const [web3, setWeb3] = useState<Web3>(readOnlyWeb3);

    // Login data
    const [address, setAddress] = useState<string | null>(null);
    const [web3BrowserName, setWeb3BrowserName] = useState(Web3Browser.MetaMask);

    // The following are almost opposites - except that they are both
    // initialized as false. LoggedInBefore means that we try to re-login again
    // when the page is loaded. Logged out means that we don't try to re-login.
    const [loggedInBefore, setLoggedInBefore] = useState(false);
    const [loggedOut, setLoggedOut] = useState(false);

    return { renNetwork, web3, setWeb3, setRenNetwork, address, setAddress, web3BrowserName, setWeb3BrowserName, loggedInBefore, setLoggedInBefore, loggedOut, setLoggedOut };
};

export const Web3Container = createContainer(useWeb3Container);
