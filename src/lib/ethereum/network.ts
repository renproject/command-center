import RenExSDK from "@renex/renex";

import { BigNumber } from "bignumber.js";
import { contracts } from "./contracts/contracts";

export const getDarknodeCount = async (sdk: RenExSDK): Promise<BigNumber> => {
    const darknodeRegistry = new ((sdk.getWeb3()).eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );
    const darknodeCount = await darknodeRegistry.methods.numDarknodes().call();
    return new BigNumber(darknodeCount.toString());
};

export const getOrderCount = async (sdk: RenExSDK): Promise<BigNumber> => {
    const orderCount = await sdk._contracts.orderbook.ordersCount();
    return new BigNumber(orderCount.toString());
};
