import Web3 from "web3";

import { OrderedSet } from "immutable";
import { sha3, toChecksumAddress } from "web3-utils";

import { EthNetwork } from "../../store/types";
import { DarknodeRegistryWeb3 } from "./contracts/bindings/darknodeRegistry";
import { getContracts } from "./contracts/contracts";

const NULL = "0x0000000000000000000000000000000000000000";

const getAllDarknodes = async (web3: Web3, ethNetwork: EthNetwork): Promise<string[]> => {
    const batchSize = 10;

    const allDarknodes = [];
    let lastDarknode = NULL;
    const filter = (address: string) => address !== NULL && address !== lastDarknode;
    do {
        const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
            getContracts(ethNetwork).DarknodeRegistry.ABI,
            getContracts(ethNetwork).DarknodeRegistry.address
        );
        const darknodes: string[] = await darknodeRegistry.methods.getDarknodes(lastDarknode, batchSize.toString()).call();
        allDarknodes.push(...darknodes.filter(filter));
        [lastDarknode] = darknodes.slice(-1);
    } while (lastDarknode !== NULL);

    return allDarknodes;
};

export const getOperatorDarknodes = async (
    web3: Web3,
    ethNetwork: EthNetwork,
    address: string,
): Promise<OrderedSet<string>> => {
    // TODO: Should addresses be made lower case or checksum addresses first?

    // Currently, the LogDarknodeRegistered logs don't include the registrar, so
    // instead we loop through every darknode and get it's owner first.
    // NOTE: Retrieving all logs only returns recent logs.

    const darknodes = await getAllDarknodes(web3, ethNetwork);

    /*
    Sample log:
    {
        address: "0x75Fa8349fc9C7C640A4e9F1A1496fBB95D2Dc3d5",
        blockHash: "0xfab9c0e4d7ccca3e56d6961fbe17917923898828b3f929093e6b976b8727db39",
        blockNumber: 9740948,
        data: "0x000000000000000000000000945458e071eca54bb534d8ac7c8cd1a3eb318d9200000000000000000000000000000000000000\
        000000152d02c7e14af6800000",
        id: "log_98d2346b",
        logIndex: 2,
        removed: false,
        topics: ["0xd2819ba4c736158371edf0be38fd8d1fc435609832e392f118c4c79160e5bd7b"],
        transactionHash: "0x8ed0e53dffda6c356e25cb1ac3ebe7a69bcab8ebf668a7b2e770480bdb47598b",
        transactionIndex: 2,
        transactionLogIndex: "0x2",
        type: "mined",
    }
    */

    // Get Registration events
    const recentRegistrationEvents = await web3.eth.getPastLogs({
        address: getContracts(ethNetwork).DarknodeRegistry.address,
        // tslint:disable-next-line:no-any
        fromBlock: getContracts(ethNetwork).DarknodeRegistry.deployedInBlock || "0x600000" as any,
        toBlock: "latest",
        // topics: [sha3("LogDarknodeRegistered(address,uint256)"), "0x000000000000000000000000" +
        // address.slice(2), null, null] as any,
        // tslint:disable-next-line:no-any
        topics: [sha3("LogDarknodeRegistered(address,uint256)")] as any,
    });
    for (const event of recentRegistrationEvents) {
        // The log data returns back like this:
        // 0x000000000000000000000000945458e071eca54bb534d8ac7c8cd1a3eb318d92000000000000000000000000000000000000000000\
        // 00152d02c7e14af6800000
        // and we want to extract this: 0x945458e071eca54bb534d8ac7c8cd1a3eb318d92 (20 bytes, 40 characters long)
        const darknodeID = toChecksumAddress(`0x${event.data.substr(26, 40)}`);
        darknodes.push(darknodeID);
    }

    // Note: Deregistration events are not included because we are unable to retrieve the operator

    // // Get Deregistration events
    // const recentDeregistrationEvents = await web3.eth.getPastLogs({
    //     address: contracts.DarknodeRegistry.address,
    //     // tslint:disable-next-line:no-any
    //     fromBlock: "0x889E55" as any, // FIXME: Change this based on network or get from address deployment
    //     toBlock: "latest",
    //     // tslint:disable-next-line:no-any
    //     topics: [sha3("LogDarknodeDeregistered(address)"), null] as any,
    // });

    // for (const event of recentDeregistrationEvents) {
    //     const darknodeID = toChecksumAddress("0x" + event.data.substr(26, 40));
    //     darknodes.push(darknodeID);
    // }

    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        getContracts(ethNetwork).DarknodeRegistry.ABI,
        getContracts(ethNetwork).DarknodeRegistry.address
    );
    const operatorPromises = darknodes.map(async (darknodeID: string) =>
        darknodeRegistry.methods.getDarknodeOwner(darknodeID).call()
    );

    let operatorDarknodes = OrderedSet<string>();

    for (let i = 0; i < darknodes.length; i++) {
        if (await operatorPromises[i] === address && !operatorDarknodes.contains(address)) {
            operatorDarknodes = operatorDarknodes.add(darknodes[i]);
        }
    }

    return operatorDarknodes;
};
