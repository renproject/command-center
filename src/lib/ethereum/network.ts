// Not currently used

import { BigNumber } from "bignumber.js";
import Web3 from "web3";

import { EthNetwork } from "../../store/types";
import { _noCapture_ } from "../errors";
import { DarknodeRegistryWeb3 } from "./contracts/bindings/darknodeRegistry";
import { getContracts } from "./contracts/contracts";

export const getDarknodeCount = async (web3: Web3, ethNetwork: EthNetwork): Promise<BigNumber> => {
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        getContracts(ethNetwork).DarknodeRegistry.ABI,
        getContracts(ethNetwork).DarknodeRegistry.address
    );
    const darknodeCount = await darknodeRegistry.methods.numDarknodes().call();
    if (darknodeCount === null) {
        throw _noCapture_(new Error("Unable to retrieve darknode count"));
    }
    return new BigNumber(darknodeCount.toString());
};
