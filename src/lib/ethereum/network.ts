// Not currently used

import Web3 from "web3";

import { BigNumber } from "bignumber.js";

import { EthNetwork } from "../../store/types";
import { DarknodeRegistryWeb3 } from "./contracts/bindings/darknodeRegistry";
import { getContracts } from "./contracts/contracts";

export const getDarknodeCount = async (web3: Web3, ethNetwork: EthNetwork): Promise<BigNumber> => {
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        getContracts(ethNetwork).DarknodeRegistry.ABI,
        getContracts(ethNetwork).DarknodeRegistry.address
    );
    const darknodeCount = await darknodeRegistry.methods.numDarknodes().call();
    return new BigNumber(darknodeCount.toString());
};
