import { RenNetworkDetails, testnet } from "@renproject/contracts";
import { useState } from "react";
import { createContainer } from "unstated-next";
import Web3 from "web3";

const useWeb3Container = () => {
    const [network, setNetwork] = useState(null as RenNetworkDetails | null);
    const [web3, setWeb3] = useState(null as Web3 | null);

    return { network, web3, setWeb3, setNetwork };
};

export const Web3Container = createContainer(useWeb3Container);
