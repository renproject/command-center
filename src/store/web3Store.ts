import { RenNetworkDetails, testnet } from "@renproject/contracts";
import { useState } from "react";
import { createContainer } from "unstated-next";
import Web3 from "web3";

const useWeb3Container = (initialState = testnet as RenNetworkDetails) => {
    const [network, setNetwork] = useState<RenNetworkDetails>(initialState);
    const [web3, setWeb3] = useState<Web3 | null>(null);

    return { network, web3, setWeb3, setNetwork };
};

export const Web3Container = createContainer(useWeb3Container);
