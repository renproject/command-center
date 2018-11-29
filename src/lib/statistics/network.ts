import RenExSDK from "renex-sdk-ts";

import { BigNumber } from "bignumber.js";

export const getDarknodeCount = async (sdk: RenExSDK): Promise<BigNumber> => {
    const darknodeCount = await sdk._contracts.darknodeRegistry.numDarknodes();
    return new BigNumber(darknodeCount.toString());
};

export const getOrderCount = async (sdk: RenExSDK): Promise<BigNumber> => {
    const orderCount = await sdk._contracts.orderbook.ordersCount();
    return new BigNumber(orderCount.toString());
};
