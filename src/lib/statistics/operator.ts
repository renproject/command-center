import RenExSDK from "@renex/renex";

import { List } from "immutable";

const NULL = "0x0000000000000000000000000000000000000000";

async function getAllDarknodes(sdk: RenExSDK): Promise<string[]> {
    const batchSize = 10;

    const allDarknodes = [];
    let lastDarknode = NULL;
    do {
        const darknodes = await sdk._contracts.darknodeRegistry.getDarknodes(lastDarknode, batchSize.toString());
        allDarknodes.push(...darknodes.filter(addr => addr !== NULL && addr !== lastDarknode));
        [lastDarknode] = darknodes.slice(-1);
    } while (lastDarknode !== NULL);

    return allDarknodes;
}

export const getOperatorDarknodes = async (sdk: RenExSDK, address: string): Promise<List<string>> => {

    // Currently, the LogDarknodeRegistered logs don't include the registrar, so
    // instead we loop through every darknode and get it's owner

    // const recentEvents = await sdk.web3().eth.getPastLogs({
    //     address: sdk._contracts.darknodeRegistry.address,
    //     // tslint:disable-next-line:no-any
    //     fromBlock: "0x8a8de3" as any,
    //     toBlock: "latest",
    //     // tslint:disable-next-line:no-any
    //     topics: [sdk.web3().utils.sha3("LogDarknodeRegistered(address,uint256)"), "0x000000000000000000000000" + address.slice(2), null, null] as any,
    // });

    const darknodes = await getAllDarknodes(sdk);

    const operatorPromises = darknodes.map((darknodeID: string) =>
        sdk._contracts.darknodeRegistry.getDarknodeOwner(darknodeID)
    );

    let operatorDarknodes = List<string>();

    for (let i = 0; i < darknodes.length; i++) {
        if (await operatorPromises[i] === address) {
            operatorDarknodes = operatorDarknodes.push(darknodes[i]);
        }
    }

    return operatorDarknodes;
};
