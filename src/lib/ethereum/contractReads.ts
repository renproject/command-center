import { RenNetworkDetails } from "@renproject/contracts";
import { Currency } from "@renproject/react-components";
import { ApolloClient } from "apollo-boost";
import BigNumber from "bignumber.js";
import { OrderedMap, OrderedSet } from "immutable";
import Web3 from "web3";
import { Block } from "web3-eth";
import { sha3, toChecksumAddress } from "web3-utils";

import { getLightnode } from "../../components/networkDarknodesPage/mapContainer";
import { retryNTimes } from "../../components/renvmPage/renvmContainer";
import { DarknodesState } from "../../store/networkStateContainer";
import { darknodeIDHexToBase58 } from "../darknode/darknodeID";
import { queryStat } from "../darknode/jsonrpc";
import { isDefined } from "../general/isDefined";
import { safePromiseAllList } from "../general/promiseAll";
import { Darknode, queryDarknode } from "../graphQL/queries/darknode";
import { RenVM } from "../graphQL/queries/renVM";
import { catchBackgroundException } from "../react/errors";
import { getDarknodePayment, getDarknodeRegistry } from "./contract";
import { getDarknodeStatus, isRegisteredInEpoch } from "./darknodeStatus";
import { NewTokenDetails, OldToken, Token, TokenPrices } from "./tokens";

export const NULL = "0x0000000000000000000000000000000000000000";

/**
 * Remove "0x" prefix from a hex string if there is one.
 *
 * @example
 * strip0x("0x1234") // "1234"
 * strip0x("1234")   // "1234"
 *
 * @param hex The string to remove "0x" from.
 */
export const strip0x = (hex: string): string => hex.substring(0, 2) === "0x" ? hex.slice(2) : hex;

/**
 * Add a "0x" prefix to a hex value, converting to a string if required.
 *
 * @example
 * Ox("1234")               // 0x1234
 * Ox("0x1234")             // 0x1234
 * Ox(Buffer([0x12, 0x34])) // 0x1234
 *
 * @param hex The string or Buffer to add "0x" to.
 */
export const Ox = (hex: string | Buffer | number | BigNumber): string => {
    const hexString = typeof hex === "string" ? hex : Buffer.isBuffer(hex) ? hex.toString("hex") : new BigNumber(hex).toString(16);
    return hexString.substring(0, 2) === "0x" ? hexString : `0x${hexString}`;
};

////////////////////////////////////////////////////////////////////////////////
// Darknode Registry contract //////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export enum RegistrationStatus {
    Unknown = "",
    Unregistered = "unregistered",
    RegistrationPending = "registration pending",
    Registered = "registered",
    DeregistrationPending = "deregistration pending",
    Deregistered = "awaiting refund period",
    Refundable = "refundable",
}

/**
 * Estimates the number of seconds per block for the network.
 *
 * @param web3 A Web3 instance.
 * @returns A promise to the estimate or null.
 */
export const calculateSecondsPerBlock = async (
    web3: Web3,
): Promise<number | null> => {
    const sampleSize = 1000;

    const fetchedBlockNumber = await web3.eth.getBlockNumber();
    let currentBlockNumber = fetchedBlockNumber;
    let currentBlock: Block | null = null;
    // If current block isn't know yet, try previous block, up to 10 times
    while (currentBlock === null && currentBlockNumber > fetchedBlockNumber - 10) {
        currentBlock = await web3.eth.getBlock(currentBlockNumber);
        currentBlockNumber -= 1;
    }
    const previousBlock: Block | null = await web3.eth.getBlock(currentBlockNumber - sampleSize) as Block | null;

    if (isDefined(currentBlock) && isDefined(previousBlock)) {
        const currentTimestamp = parseInt(currentBlock.timestamp.toString(), 10);
        const previousTimestamp = parseInt(previousBlock.timestamp.toString(), 10);
        return Math.floor((currentTimestamp - previousTimestamp) / sampleSize);
    }
    return null;
};

export const HistoryIterations = 5;

// export enum HistoryPeriod {
//     Day = 60 * 60 * 24,
//     Week = Day * 7,
//     Month = Week * 4,
//     HalfYear = Week * 26,
//     Year = Week * 52,
// }

// /**
//  * Given a history period, retrieves the darknode's balance history for
//  * intervals in the period.
//  *
//  * @param web3 A Web3 instance.
//  * @param darknodeID The ID of the darknode as a hex string.
//  * @param previousHistory The previous data-points so we don't repeat requests.
//  * @param historyPeriod The history period to fetch the balance history for.
//  * @param secondsPerBlock An estimate of the time between blocks in the network.
//  * @returns Returns a promise to a map from block numbers to the corresponding
//  *          balance.
//  */
// export const fetchDarknodeBalanceHistory = async (
//     web3: Web3,
//     darknodeID: string,
//     previousHistory: OrderedMap<number, BigNumber> | null,
//     historyPeriod: HistoryPeriod,
//     secondsPerBlock: number,
// ): Promise<OrderedMap<number, BigNumber>> => {
//     let balanceHistory = previousHistory || OrderedMap<number, BigNumber>();

//     // If the page is kept open, the history data will keep growing, so we limit
//     // it to 200 entries.
//     if (balanceHistory.size > 200) {
//         balanceHistory = OrderedMap<number, BigNumber>();
//     }

//     const currentBlock = await web3.eth.getBlockNumber();

//     const jump = Math.floor((historyPeriod / secondsPerBlock) / HistoryIterations);

//     for (let i = 0; i < HistoryIterations; i++) {
//         // Move back by `jump` blocks
//         let block = currentBlock - i * jump;

//         // ...
//         block = block - block % jump;

//         if (!balanceHistory.has(block)) {
//             const blockBalance = await web3.eth.getBalance(darknodeID, block) as string | null;

//             if (isDefined(blockBalance)) {
//                 const balance = new BigNumber(blockBalance.toString());
//                 balanceHistory = balanceHistory.set(block, balance);
//             }
//         }
//     }

//     // Also add most recent block
//     if (!balanceHistory.has(currentBlock)) {
//         const currentBalance = await web3.eth.getBalance(darknodeID, currentBlock) as string | null;

//         if (isDefined(currentBalance)) {
//             const balance = new BigNumber(currentBalance.toString());
//             balanceHistory = balanceHistory.set(currentBlock, balance);
//         }
//     }

//     balanceHistory = balanceHistory.sortBy((_: BigNumber, value: number) => value);

//     return balanceHistory;
// };

/**
 * Find the darknodes by reading the logs of the Darknode Registry.
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @param fromBlock The starting block to look at logs for.
 * @returns An immutable set of darknode IDs (as hex strings).
 */
const retrieveDarknodesInLogs = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    fromBlock: string | number,
    operatorAddress: string,
) => {
    let darknodes = OrderedSet();

    /**
     * Sample log:
     * ```json
     * {
     *     address: "0x75Fa8349fc9C7C640A4e9F1A1496fBB95D2Dc3d5",
     *     blockHash: "0xfab9c0e4d7ccca3e56d6961fbe17917923898828b3f929093e6b976b8727db39",
     *     blockNumber: 9740948,
     *     data: "0x000000000000000000000000945458e071eca54bb534d8ac7c8cd1a3eb318d92000000000000000000000000000000000000\
     *     00000000152d02c7e14af6800000",
     *     id: "log_98d2346b",
     *     logIndex: 2,
     *     removed: false,
     *     topics: ["0xd2819ba4c736158371edf0be38fd8d1fc435609832e392f118c4c79160e5bd7b"],
     *     transactionHash: "0x8ed0e53dffda6c356e25cb1ac3ebe7a69bcab8ebf668a7b2e770480bdb47598b",
     *     transactionIndex: 2,
     *     transactionLogIndex: "0x2",
     *     type: "mined",
     * }
     * ```
     */

    let recentRegistrationEvents = await web3.eth.getPastLogs({
        address: renNetwork.addresses.ren.DarknodeRegistry.address,
        fromBlock,
        toBlock: "latest",
        // topics: [sha3("LogDarknodeRegistered(address,uint256)"), "0x000000000000000000000000" +
        // address.slice(2), null, null] as any,
        topics: [sha3("LogDarknodeRegistered(address,uint256)")],
    });
    const recentRegistrationEvents2 = await web3.eth.getPastLogs({
        address: renNetwork.addresses.ren.DarknodeRegistry.address,
        fromBlock,
        toBlock: "latest",
        // topics: [sha3("LogDarknodeRegistered(address,uint256)"), "0x000000000000000000000000" +
        // address.slice(2), null, null] as any,
        topics: [sha3("LogDarknodeRegistered(address,address,uint256)"), "0x000000000000000000000000" + strip0x(operatorAddress)],
    });
    recentRegistrationEvents = recentRegistrationEvents.concat(recentRegistrationEvents2);
    for (const event of recentRegistrationEvents) {
        // The log data returns back like this:
        // 0x000000000000000000000000945458e071eca54bb534d8ac7c8cd1a3eb318d9200000000000000000000000000000000000000000000152d02c7e14af6800000
        // and we want to extract this: 0x945458e071eca54bb534d8ac7c8cd1a3eb318d92 (20 bytes, 40 characters long)
        const prefixLength = 2;
        const dataLength = 64;
        const addressLength = 40;
        const start = dataLength + prefixLength - addressLength; // 26

        let darknodeID;
        let operator;
        if (event.topics.length === 3) {
            darknodeID = toChecksumAddress(`0x${(event.topics[2] as string).substr(start, addressLength)}`);
            operator = toChecksumAddress(`0x${(event.topics[1] as string).substr(start, addressLength)}`);
        } else {
            darknodeID = toChecksumAddress(`0x${event.data.substr(start, addressLength)}`);
        }
        darknodes = darknodes.add({ darknodeID, operator });
    }

    // Note: Deregistration events are not included because we are unable to retrieve the operator
    // const recentDeregistrationEvents = await web3.eth.getPastLogs({
    //     address: contracts.DarknodeRegistry.address,
    //     fromBlock: renNetwork.addresses.ren.DarknodeRegistry.block || "0x600000",
    //     toBlock: "latest",
    //     topics: [sha3("LogDarknodeDeregistered(address)"), null],
    // });
    // for (const event of recentDeregistrationEvents) {
    //     const darknodeID = toChecksumAddress("0x" + event.data.substr(26, 40));
    //     darknodes.push(darknodeID);
    // }

    return darknodes;
};

/**
 * Find the darknodes for an operator.
 *
 * Currently, the LogDarknodeRegistered logs don't include the registrar, so
 * instead we loop through every darknode and get it's owner first.
 * This would be a lot faster if the logs indexed the operator! 🤦
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @param operatorAddress The address of the operator to look up darknodes for.
 * @param onDarknode An optional callback to retrieve darknodes as they are
 *        found, instead of waiting for all of them to be returned together.
 * @returns An immutable set of darknode IDs (as hex strings).
 */
export const getOperatorDarknodes = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    operatorAddress: string,
    reportProgress?: (progress: number, total: number) => void,
    onDarknode?: (darknodeID: string) => void,
): Promise<OrderedSet<string>> => {
    let darknodes = OrderedSet();

    const darknodeRegistry = getDarknodeRegistry(web3, renNetwork);

    // Retrieve darknodes that are pending registration.

    // Get Registration events.

    // We may want to only look at the current epoch first, to retrieve pending
    // registrations, before looking for deregistrations across all blocks.
    // Only look from the last epoch, since we are
    // only interested in newly registered darknodes.
    // const epoch = await darknodeRegistry.methods.currentEpoch().call();
    // const fromBlock = epoch ? `0x${new BigNumber(epoch.blocknumber.toString()).toString(16)}` : renNetwork.addresses.ren.DarknodeRegistry.block || "0x00";

    operatorAddress = toChecksumAddress(operatorAddress);

    const fromBlock = renNetwork.addresses.ren.DarknodeRegistry.block || "0x00";

    darknodes = darknodes.concat(await retrieveDarknodesInLogs(web3, renNetwork, fromBlock, operatorAddress));

    const operatorPromises = darknodes.map(async ({ operator, darknodeID }: { operator: string, darknodeID: string }) => {
        if (operator) {
            return [darknodeID, operator];
        } else {
            // For backwards compatibility.
            return [darknodeID, await retryNTimes(async () => await darknodeRegistry.methods.getDarknodeOperator(darknodeID).call(), 2)] as [string, string];
        }
    }).toArray();

    let operatorDarknodes = OrderedSet<string>();

    for (let i = 0; i < operatorPromises.length; i++) {
        if (reportProgress) { reportProgress(i, operatorPromises.length); }
        const [darknodeID, operator] = await operatorPromises[i];
        if (operator.toLowerCase() === operatorAddress.toLowerCase() && !operatorDarknodes.contains(operatorAddress)) {
            operatorDarknodes = operatorDarknodes.add(darknodeID);
            if (onDarknode) { onDarknode(darknodeID); }
        }
    }

    if (reportProgress) { reportProgress(operatorPromises.length, operatorPromises.length); }

    return operatorDarknodes;
};

////////////////////////////////////////////////////////////////////////////////
// Darknode Payment contract ///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Sum up fees into the total ETH value (in wei).
export const sumUpFeeMap = (
    feesEarned: OrderedMap<Token | OldToken, BigNumber>,
    tokenPrices: TokenPrices,
): [BigNumber, OrderedMap<Token, BigNumber>] => {

    let totalEth = new BigNumber(0);

    const feesEarnedInEth = NewTokenDetails.map((tokenDetails, token) => {
        const price = tokenPrices.get(token, undefined);
        const decimals = tokenDetails ? new BigNumber(tokenDetails.decimals.toString()).toNumber() : 0;
        const inEth = feesEarned.get(token, new BigNumber(0))
            .div(Math.pow(10, decimals))
            .multipliedBy(price ? price.get(Currency.ETH, 0) : 0);
        totalEth = totalEth.plus(inEth);
        return inEth;
    });

    // Convert to wei
    return [totalEth.multipliedBy(new BigNumber(10).pow(18)), feesEarnedInEth];
};

////////////////////////////////////////////////////////////////////////////////
// Darknode Payment contract ///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Retrieves the balances from the DarknodePayment contract.
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @param darknodeID The ID of the darknode as a hex string.
 * @returns Returns a promise to an immutable map from token codes to balances
 *          as BigNumbers.
 */
const getBalances = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    darknodeID: string,
): Promise<OrderedMap<Token, BigNumber>> => {
    const darknodePayment = getDarknodePayment(web3, renNetwork);

    let feesEarned = OrderedMap<Token, BigNumber>();

    // const address = (await web3.eth.getAccounts())[0];

    const balances = await safePromiseAllList(
        NewTokenDetails.map(async (_tokenDetails, token) => {
            let balance1;
            try {
                const balance1Call = await retryNTimes(async () => await darknodePayment.methods.darknodeBalances(darknodeID, renNetwork.addresses.tokens[token].address).call(), 2);
                balance1 = new BigNumber((balance1Call || "0").toString());
            } catch (error) {
                catchBackgroundException(error, "Error in contractReads > darknodeBalances");
                balance1 = new BigNumber(0);
            }
            return {
                balance: balance1, // .plus(balance2),
                token: token as Token | null,
            };
        }).valueSeq().toList(),
        {
            balance: new BigNumber(0),
            token: null,
        }
    );

    for (const { balance, token } of balances.toArray()) {
        if (token) {
            feesEarned = feesEarned.set(token, balance);
        }
    }

    return feesEarned;
};

export enum DarknodeFeeStatus {
    BLACKLISTED = "BLACKLISTED",
    CLAIMED = "CLAIMED",
    NOT_CLAIMED = "NOT_CLAIMED",
    NOT_WHITELISTED = "NOT_WHITELISTED",
}

const getDarknodeFees = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    darknodeID: string,
    tokenPrices: TokenPrices | null,
) => {
    // Get earned fees
    const feesEarned = await getBalances(web3, renNetwork, darknodeID);
    const oldFeesEarned = OrderedMap<OldToken, BigNumber>();
    let feesEarnedTotalEth = new BigNumber(0);
    if (tokenPrices) {
        //
        // tslint:disable-next-line: whitespace
        const [oldFeesInEth,] = sumUpFeeMap(oldFeesEarned, tokenPrices);
        // tslint:disable-next-line: whitespace
        const [newFeesInEth,] = sumUpFeeMap(feesEarned, tokenPrices);
        feesEarnedTotalEth = newFeesInEth.plus(oldFeesInEth);
    }

    return { feesEarned, oldFeesEarned, feesEarnedTotalEth };
};

const getDarknodeCycleRewards = async (
    renVM: RenVM,
    darknode: Darknode | null,
    web3: Web3,
    renNetwork: RenNetworkDetails,
    darknodeID: string,
    registrationStatus: RegistrationStatus,
) => {
    // Cycle status ////////////////////////////////////////////////////////////

    const darknodePayment = getDarknodePayment(web3, renNetwork);

    let currentStatus;
    let previousStatus;
    const isRegisteredInPreviousEpoch = darknode && isRegisteredInEpoch(darknode, renVM.previousEpoch);
    currentStatus = registrationStatus === RegistrationStatus.Registered ? DarknodeFeeStatus.NOT_CLAIMED : DarknodeFeeStatus.NOT_WHITELISTED;
    if (!isRegisteredInPreviousEpoch) {
        previousStatus = DarknodeFeeStatus.NOT_WHITELISTED;
    } else {
        const claimed = await retryNTimes(async () => await darknodePayment.methods.rewardClaimed(darknodeID, renVM.previousCycle.toString()).call(), 2);
        if (claimed) {
            previousStatus = DarknodeFeeStatus.CLAIMED;
        } else {
            previousStatus = DarknodeFeeStatus.NOT_CLAIMED;
        }
    }

    let cycleStatus = OrderedMap<string, DarknodeFeeStatus>();
    if (isDefined(renVM.currentCycle)) {
        cycleStatus = cycleStatus.set(renVM.currentCycle.toString(), currentStatus);
    }
    if (isDefined(renVM.previousCycle)) {
        cycleStatus = cycleStatus.set(renVM.previousCycle.toString(), previousStatus);
    }

    return cycleStatus;
};

/**
 * Fetches various pieces of information about a darknode, including:
 *  1. publicKey,
 *  2. balances and fees
 *  3. its status
 *  4. its gas usage information
 *  5. its network information (NOTE: not implemented yet)
 *
 * @param client GraphQL client connected to RenVM subgraph.
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @param darknodeID The ID of the darknode as a hex string.
 * @param tokenPrices
 * @returns A promise to the darknode state record.
 */
export const fetchDarknodeDetails = async (
    client: ApolloClient<object>,
    renVM: RenVM,
    web3: Web3,
    renNetwork: RenNetworkDetails,
    darknodeID: string,
    tokenPrices: TokenPrices | null,
): Promise<DarknodesState> => {
    darknodeID = toChecksumAddress(darknodeID.toLowerCase());

    const darknode = await queryDarknode(client, darknodeID);

    // Get eth Balance
    const πEthBalance = web3.eth.getBalance(darknodeID)
        .then((ethBalanceBN) => ethBalanceBN ? new BigNumber(ethBalanceBN.toString()) : new BigNumber(0))
        .catch(() => new BigNumber(0));

    const πFees = getDarknodeFees(web3, renNetwork, darknodeID, tokenPrices);

    // Call queryStats
    const πNodeStatistics = queryStat(getLightnode(renNetwork), darknodeIDHexToBase58(darknodeID))
        .catch((error) => /* ignore */ null);

    // Get registration status
    const registrationStatus = darknode ? getDarknodeStatus(darknode, renVM) : RegistrationStatus.Unregistered;

    const πCycleStatuses = getDarknodeCycleRewards(renVM, darknode, web3, renNetwork, darknodeID, registrationStatus);

    const { feesEarned, oldFeesEarned, feesEarnedTotalEth } = await πFees;

    return new DarknodesState({
        ID: darknodeID,
        multiAddress: "" as string,
        publicKey: darknode ? darknode.publicKey : undefined,
        ethBalance: await πEthBalance,
        feesEarned,
        oldFeesEarned,
        feesEarnedTotalEth,

        cycleStatus: await πCycleStatuses,
        averageGasUsage: 0,
        lastTopUp: null,
        expectedExhaustion: null,
        peers: 0,
        registrationStatus,
        operator: darknode ? darknode.operator : undefined,

        nodeStatistics: await πNodeStatistics,
    });
};
