import { mainnet, RenNetworkDetails } from "@renproject/contracts";
import { Currency } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { OrderedMap, OrderedSet } from "immutable";
import Web3 from "web3";
import { Block } from "web3-eth";
import { sha3, toChecksumAddress } from "web3-utils";

import { getLightnode } from "../../components/overviewPage/mapContainer";
import { DarknodesState } from "../../store/applicationState";
import { darknodeIDHexToBase58 } from "../darknode/darknodeID";
import { queryStat } from "../darknode/jsonrpc";
import { safePromiseAllList, safePromiseAllMap } from "../general/promiseAll";
import { _captureBackgroundException_, _noCapture_ } from "../react/errors";
import { getDarknodePayment, getDarknodePaymentStore, getDarknodeRegistry } from "./contract";
import { NewTokenDetails, OldToken, OldTokenDetails, Token, TokenPrices } from "./tokens";

// Remove 0x prefix from a hex string
export const strip0x = (hex: string) => hex.substring(0, 2) === "0x" ? hex.slice(2) : hex;

// Add a 0x prefix to a hex value, converting to a string first
export const Ox = (hex: string | Buffer) => {
    const hexString = typeof hex === "string" ? hex : hex.toString("hex");
    return hexString.substring(0, 2) === "0x" ? hexString : `0x${hexString}`;
};

////////////////////////////////////////////////////////////////////////////////
// Darknode Registry contract //////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * Fetches the minimum bond from the Darknode Registry contract.
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @returns A promise to the minimum bond as a BigNumber.
 */
export const getMinimumBond = async (web3: Web3, renNetwork: RenNetworkDetails): Promise<BigNumber> => {
    const minimumBond = (await getDarknodeRegistry(web3, renNetwork).methods.minimumBond().call()) || "100000000000000000000000";
    return new BigNumber((minimumBond).toString());
};

/**
 * Fetches a darknode's public key from the Darknode Registry contract.
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @returns A promise to the public key as a hex string.
 */
const getDarknodePublicKey = async (web3: Web3, renNetwork: RenNetworkDetails, darknodeID: string): Promise<string> => {
    const publicKey = await getDarknodeRegistry(web3, renNetwork).methods.getDarknodePublicKey(darknodeID).call();
    if (publicKey === null) {
        throw _noCapture_(new Error("Unable to retrieve darknode public key"));
    }
    return publicKey;
};

/**
 * Fetches a darknode's operator address from the Darknode Registry contract.
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @returns A promise to the operator as a hex string.
 */
const getDarknodeOperator = async (web3: Web3, renNetwork: RenNetworkDetails, darknodeID: string): Promise<string> => {
    const owner = await getDarknodeRegistry(web3, renNetwork).methods.getDarknodeOwner(darknodeID).call();
    if (owner === null) {
        throw _noCapture_(new Error("Unable to retrieve darknode owner"));
    }
    return owner;
};

export interface DarknodeCounts {
    currentDarknodeCount: number;
    previousDarknodeCount: number;
    nextDarknodeCount: number;
}

export const getDarknodeCounts = async (web3: Web3, renNetwork: RenNetworkDetails): Promise<DarknodeCounts> => {
    const darknodeRegistry = getDarknodeRegistry(web3, renNetwork);
    const currentEpoch = await darknodeRegistry.methods.numDarknodes().call();
    if (currentEpoch === null) { throw _noCapture_(new Error("Unable to retrieve darknode count")); }
    const previousEpoch = await darknodeRegistry.methods.numDarknodesPreviousEpoch().call();
    if (previousEpoch === null) { throw _noCapture_(new Error("Unable to retrieve darknode count")); }
    const nextEpoch = await darknodeRegistry.methods.numDarknodesNextEpoch().call();
    if (nextEpoch === null) { throw _noCapture_(new Error("Unable to retrieve darknode count")); }
    return {
        currentDarknodeCount: new BigNumber(currentEpoch.toString()).toNumber(),
        previousDarknodeCount: new BigNumber(previousEpoch.toString()).toNumber(),
        nextDarknodeCount: new BigNumber(nextEpoch.toString()).toNumber(),
    };
};

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
 * Retrieves the registration status of a darknode.
 *
 * It can be one of Unregistered, RegistrationPending, Registered,
 * DeregistrationPending, Deregistered or Refundable.
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @param darknodeID The ID of the darknode as a hex string.
 * @returns A promise to the registration status.
 */
export const getDarknodeStatus = async (web3: Web3, renNetwork: RenNetworkDetails, darknodeID: string): Promise<RegistrationStatus> => {
    const darknodeRegistry = getDarknodeRegistry(web3, renNetwork);

    const [
        isPendingRegistration,
        isPendingDeregistration,
        isDeregisterable,
        isRefunded,
        isRefundable,
    ] = await Promise.all([
        darknodeRegistry.methods.isPendingRegistration(darknodeID).call(),
        darknodeRegistry.methods.isPendingDeregistration(darknodeID).call(),
        darknodeRegistry.methods.isDeregisterable(darknodeID).call(),
        darknodeRegistry.methods.isRefunded(darknodeID).call(),
        darknodeRegistry.methods.isRefundable(darknodeID).call(),
    ]);

    if (isRefunded) {
        return RegistrationStatus.Unregistered;
    } else if (isPendingRegistration) {
        return RegistrationStatus.RegistrationPending;
    } else if (isDeregisterable) {
        return RegistrationStatus.Registered;
    } else if (isPendingDeregistration) {
        return RegistrationStatus.DeregistrationPending;
    } else if (isRefundable) {
        return RegistrationStatus.Refundable;
    } else {
        return RegistrationStatus.Deregistered;
    }
};

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

    if (currentBlock !== null && previousBlock !== null) {
        const currentTimestamp = parseInt(currentBlock.timestamp.toString(), 10);
        const previousTimestamp = parseInt(previousBlock.timestamp.toString(), 10);
        return Math.floor((currentTimestamp - previousTimestamp) / sampleSize);
    }
    return null;
};

export const HistoryIterations = 5;

export enum HistoryPeriod {
    Day = 60 * 60 * 24,
    Week = Day * 7,
    Month = Week * 4,
    HalfYear = Week * 26,
    Year = Week * 52,
}

/**
 * Given a history period, retrieves the darknode's balance history for
 * intervals in the period.
 *
 * @param web3 A Web3 instance.
 * @param darknodeID The ID of the darknode as a hex string.
 * @param previousHistory The previous data-points so we don't repeat requests.
 * @param historyPeriod The history period to fetch the balance history for.
 * @param secondsPerBlock An estimate of the time between blocks in the network.
 * @returns Returns a promise to a map from block numbers to the corresponding
 *          balance.
 */
export const fetchDarknodeBalanceHistory = async (
    web3: Web3,
    darknodeID: string,
    previousHistory: OrderedMap<number, BigNumber> | null,
    historyPeriod: HistoryPeriod,
    secondsPerBlock: number,
): Promise<OrderedMap<number, BigNumber>> => {
    let balanceHistory = previousHistory || OrderedMap<number, BigNumber>();

    // If the page is kept open, the history data will keep growing, so we limit
    // it to 200 entries.
    if (balanceHistory.size > 200) {
        balanceHistory = OrderedMap<number, BigNumber>();
    }

    const currentBlock = await web3.eth.getBlockNumber();

    const jump = Math.floor((historyPeriod / secondsPerBlock) / HistoryIterations);

    for (let i = 0; i < HistoryIterations; i++) {
        // Move back by `jump` blocks
        let block = currentBlock - i * jump;

        // ...
        block = block - block % jump;

        if (!balanceHistory.has(block)) {
            const blockBalance = await web3.eth.getBalance(darknodeID, block) as string | null;

            if (blockBalance !== null) {
                const balance = new BigNumber(blockBalance.toString());
                balanceHistory = balanceHistory.set(block, balance);
            }
        }
    }

    // Also add most recent block
    if (!balanceHistory.has(currentBlock)) {
        const currentBalance = await web3.eth.getBalance(darknodeID, currentBlock) as string | null;

        if (currentBalance !== null) {
            const balance = new BigNumber(currentBalance.toString());
            balanceHistory = balanceHistory.set(currentBlock, balance);
        }
    }

    balanceHistory = balanceHistory.sortBy((_: BigNumber, value: number) => value);

    return balanceHistory;
};

/**
 * Fetches all the darknodes from the Darknode Registry contract.
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @returns A promise to the list of all darknode IDs (as hex string).
 */
export const getAllDarknodes = async (web3: Web3, renNetwork: RenNetworkDetails): Promise<string[]> => {
    const batchSize = 10;
    const NULL = "0x0000000000000000000000000000000000000000";

    const allDarknodes = [];
    let lastDarknode = NULL;
    const filter = (address: string) => address !== NULL && address !== lastDarknode;
    do {
        const darknodeRegistry = getDarknodeRegistry(web3, renNetwork);
        const darknodes = (await darknodeRegistry.methods.getDarknodes(lastDarknode, batchSize.toString()).call());
        if (darknodes === null) {
            throw _noCapture_(new Error("Error calling 'darknodeRegistry.methods.getDarknodes'"));
        }
        allDarknodes.push(...darknodes.filter(filter));
        [lastDarknode] = darknodes.slice(-1);
    } while (lastDarknode !== NULL);

    return allDarknodes;
};

/**
 * Find the darknodes by reading the logs of the Darknode Registry.
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @param fromBlock The starting block to look at logs for.
 * @returns An immutable set of darknode IDs (as hex strings).
 */
const retrieveDarknodesInLogs = async (web3: Web3, renNetwork: RenNetworkDetails, fromBlock: string | number, operatorAddress: string) => {
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

    const recentRegistrationEvents = await web3.eth.getPastLogs({
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
    recentRegistrationEvents.concat(recentRegistrationEvents2);
    for (const event of recentRegistrationEvents) {
        // The log data returns back like this:
        // 0x000000000000000000000000945458e071eca54bb534d8ac7c8cd1a3eb318d92000000000000000000000000000000000000000000\
        // 00152d02c7e14af6800000
        // and we want to extract this: 0x945458e071eca54bb534d8ac7c8cd1a3eb318d92 (20 bytes, 40 characters long)
        let darknodeID;
        if (event.topics.length === 2) {
            darknodeID = toChecksumAddress(`0x${(event.topics[1] as string).substr(26, 40)}`);
        } else {
            darknodeID = toChecksumAddress(`0x${event.data.substr(26, 40)}`);
        }
        darknodes = darknodes.add(darknodeID);
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
    onDarknode?: (darknodeID: string) => void,
    reportProgress?: (progress: number, total: number) => void,
): Promise<OrderedSet<string>> => {

    // Skip calling getAllDarknodes - they will all be in the logs as well.
    let darknodes = OrderedSet(
        // Retrieve currently registered darknodes.
        // await getAllDarknodes(web3, renNetwork)
    );

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

    const operatorPromises = darknodes.map(async (darknodeID: string) => {
        return [darknodeID, await darknodeRegistry.methods.getDarknodeOwner(darknodeID).call()] as [string, string];
    }).toArray();

    let operatorDarknodes = OrderedSet<string>();

    for (let i = 0; i < operatorPromises.length; i++) {
        if (reportProgress) { reportProgress(i, operatorPromises.length); }
        const [darknodeID, operator] = await operatorPromises[i];
        if (operator === operatorAddress && !operatorDarknodes.contains(operatorAddress)) {
            operatorDarknodes = operatorDarknodes.add(darknodeID);
            if (onDarknode) { onDarknode(darknodeID); }
        }
    }

    if (reportProgress) { reportProgress(operatorPromises.length, operatorPromises.length); }

    return operatorDarknodes;
};

////////////////////////////////////////////////////////////////////////////////
// Darknode Reward Vault contract //////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// Sum up fees into the total ETH value (in wei).
const sumUpFeeMap = (
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

/**
 * Retrieves information about the pending rewards in the Darknode Payment
 * contract.
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @param tokenPrices A TokenPrices map to convert the total in ETH.
 * @returns `{
 *     pendingRewards: For each cycle, a map from tokens to rewards
 *     currentCycle: The current cycle (as a block number)
 *     previousCycle: The previous cycle (as a block number)
 *     cycleTimeout: The earliest the current cycle could end (as a block number)
 *     pendingTotalInEth: For each cycle, The pending rewards added up as ETH
 * }`
 */
export const fetchCycleAndPendingRewards = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    tokenPrices: TokenPrices | null,
) => {
    const darknodePayment = getDarknodePayment(web3, renNetwork);
    const darknodeRegistry = getDarknodeRegistry(web3, renNetwork);

    let pendingRewards = OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>();

    const currentCycle = await darknodePayment.methods.currentCycle().call();
    const previousCycle = await darknodePayment.methods.previousCycle().call();

    const previous = await safePromiseAllMap(
        NewTokenDetails.map(async (_tokenDetails, token) => {
            try {
                const address = token === Token.ETH ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" : renNetwork.addresses.tokens[token].address;
                const previousCycleRewardShareBN = await darknodePayment.methods.previousCycleRewardShare(address).call();
                if (previousCycleRewardShareBN === null) {
                    return new BigNumber(0);
                }
                return new BigNumber(previousCycleRewardShareBN.toString());
            } catch (error) {
                console.error(`Error fetching rewards for ${token}`, error);
                return new BigNumber(0);
            }
        }).toOrderedMap(),
        new BigNumber(0),
    );
    if (previousCycle !== null) {
        pendingRewards = pendingRewards.set(previousCycle.toString(), previous);
    }

    const currentShareCountBN = await darknodeRegistry.methods.numDarknodesPreviousEpoch().call();
    const currentShareCount = currentShareCountBN === null ? null : new BigNumber(currentShareCountBN.toString());
    const current = await safePromiseAllMap(
        NewTokenDetails.map(async (_tokenDetails, token) => {
            if (currentShareCount === null || currentShareCount.isZero()) {
                return new BigNumber(0);
            }
            try {
                const address = token === Token.ETH ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" : renNetwork.addresses.tokens[token].address;
                const currentCycleRewardPool = await darknodePayment.methods.currentCycleRewardPool(address).call();
                if (currentCycleRewardPool === null) {
                    return new BigNumber(0);
                }
                return new BigNumber((currentCycleRewardPool).toString()).div(currentShareCount);
            } catch (error) {
                console.error(`Error fetching rewards for ${token}`, error);
                return new BigNumber(0);
            }
        }
        ).toOrderedMap(),
        new BigNumber(0),
    );
    if (currentCycle !== null) {
        pendingRewards = pendingRewards.set(currentCycle.toString(), current);
    }

    const epoch = await darknodeRegistry.methods.currentEpoch().call();
    const minimumEpochInterval = await darknodeRegistry.methods.minimumEpochInterval().call();
    const cycleTimeout = !epoch ? new BigNumber(0) : new BigNumber(epoch.blocktime).plus(new BigNumber(minimumEpochInterval || 0));

    // const cycleTimeoutBN = await darknodePayment.methods.cycleTimeout().call();
    // const cycleTimeout = cycleTimeoutBN ? new BigNumber(cycleTimeoutBN.toString()) : null;

    let pendingTotalInEth = null;
    let pendingRewardsInEth = null;
    if (tokenPrices) {
        const [previousTotal, previousInEth] = sumUpFeeMap(previous, tokenPrices);
        const [currentTotal, currentInEth] = sumUpFeeMap(current, tokenPrices);
        pendingTotalInEth = OrderedMap<string /* cycle */, BigNumber>();
        pendingRewardsInEth = OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>();
        if (previousCycle !== null) {
            pendingTotalInEth = pendingTotalInEth.set(previousCycle.toString(), previousTotal);
            pendingRewardsInEth = pendingRewardsInEth.set(previousCycle.toString(), previousInEth);
        }
        if (currentCycle !== null) {
            pendingTotalInEth = pendingTotalInEth.set(currentCycle.toString(), currentTotal);
            pendingRewardsInEth = pendingRewardsInEth.set(currentCycle.toString(), currentInEth);
        }
    }

    return {
        pendingRewards,
        currentCycle,
        previousCycle,
        cycleTimeout,
        pendingTotalInEth,
        pendingRewardsInEth,
        currentShareCount,
    };
};

/**
 * Retrieves the balances from the old DarknodeRewardVault contract, which is
 * only deployed on mainnet.
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @param darknodeID The ID of the darknode as a hex string.
 * @returns Returns a promise to an immutable map from token codes to balances
 *          as BigNumbers.
 */
export const getOldBalances = async (
    web3: Web3,
    renNetwork: typeof mainnet,
    darknodeID: string,
): Promise<OrderedMap<OldToken, BigNumber>> => {

    const contract = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodeRewardVault.abi,
        renNetwork.addresses.ren.DarknodeRewardVault.address,
    );

    let feesEarned = OrderedMap<OldToken, BigNumber>();

    const balances = OldTokenDetails.map(async (_tokenDetails, token) => {

        const balance = new BigNumber(await contract.methods.darknodeBalances(darknodeID, renNetwork.addresses.oldTokens[token].address).call());

        return {
            balance,
            token,
        };
    }).valueSeq();
    // TODO: Don't use Promise.all
    const res = await Promise.all(balances);

    for (const { balance, token } of res) {
        feesEarned = feesEarned.set(token, balance);
    }

    return feesEarned;
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
                const balance1Call = await darknodePayment.methods.darknodeBalances(darknodeID, renNetwork.addresses.tokens[token]).call();
                balance1 = new BigNumber((balance1Call || "0").toString());
            } catch (error) {
                balance1 = new BigNumber(0);
            }
            // const balance2 = tokenDetails.wrapped ? await new (web3.eth.Contract)(
            //     contracts.WarpGateToken.abi,
            //     tokenDetails.address,
            // ).methods.balanceOf(address).call() : new BigNumber(0);

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

/**
 * Fetches various pieces of information about a darknode, including:
 *  1. publicKey,
 *  2. balances and fees
 *  3. its status
 *  4. its gas usage information
 *  5. its network information (NOTE: not implemented yet)
 *
 * @param web3 A Web3 instance.
 * @param renNetwork A Ren network object.
 * @param darknodeID The ID of the darknode as a hex string.
 * @param tokenPrices
 * @returns A promise to the darknode state record.
 */
export const fetchDarknodeDetails = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    darknodeID: string,
    tokenPrices: TokenPrices | null,
): Promise<DarknodesState> => {
    darknodeID = toChecksumAddress(darknodeID.toLowerCase());

    // Get eth Balance
    const ethBalanceBN = await web3.eth.getBalance(darknodeID);

    let ethBalance = new BigNumber(0);
    if (ethBalanceBN) {
        ethBalance = new BigNumber(ethBalanceBN.toString());
    }

    // Get earned fees
    const feesEarned = await getBalances(web3, renNetwork, darknodeID);
    let oldFeesEarned = OrderedMap<OldToken, BigNumber>();
    if (renNetwork.name === "mainnet") {
        oldFeesEarned = await getOldBalances(web3, renNetwork as typeof mainnet, darknodeID);
    }
    let feesEarnedTotalEth = new BigNumber(0);
    if (tokenPrices) {
        //
        // tslint:disable-next-line: whitespace
        const [oldFeesInEth,] = sumUpFeeMap(oldFeesEarned, tokenPrices);
        // tslint:disable-next-line: whitespace
        const [newFeesInEth,] = sumUpFeeMap(feesEarned, tokenPrices);
        feesEarnedTotalEth = newFeesInEth.plus(oldFeesInEth);
    }

    // Get darknode operator and public key
    const operator = await getDarknodeOperator(web3, renNetwork, darknodeID);
    const publicKey = await getDarknodePublicKey(web3, renNetwork, darknodeID);

    // Get registration status
    let registrationStatus = RegistrationStatus.Unknown;
    try {
        registrationStatus = await getDarknodeStatus(web3, renNetwork, darknodeID);
    } catch (error) {
        _captureBackgroundException_(error, {
            description: "Unknown darknode registration status",
        });
    }

    // Cycle status ////////////////////////////////////////////////////////////

    const darknodePayment = getDarknodePayment(web3, renNetwork);
    const darknodePaymentStore = getDarknodePaymentStore(web3, renNetwork);

    const currentCycleBN = await darknodePayment.methods.currentCycle().call();
    const previousCycleBN = await darknodePayment.methods.previousCycle().call();
    // const blacklisted = await darknodePaymentStore.methods.isBlacklisted(darknodeID).call();
    const darknodeRegistry = getDarknodeRegistry(web3, renNetwork);
    let currentStatus;
    let previousStatus;
    const isRegisteredInPreviousEpoch = await darknodeRegistry.methods.isRegisteredInPreviousEpoch(darknodeID).call();
    currentStatus = registrationStatus === RegistrationStatus.Registered ? DarknodeFeeStatus.NOT_CLAIMED : DarknodeFeeStatus.NOT_WHITELISTED;
    const cycleStartTimeBN = await darknodePayment.methods.cycleStartTime().call();
    if (!cycleStartTimeBN || !isRegisteredInPreviousEpoch) { // || whitelistedTime.gte(cycleStartTimeBN.toString())) {
        previousStatus = DarknodeFeeStatus.NOT_WHITELISTED;
    } else {
        if (previousCycleBN === null) {
            previousStatus = DarknodeFeeStatus.CLAIMED;
        } else {
            const claimed = await darknodePayment.methods.rewardClaimed(darknodeID, previousCycleBN.toString()).call();
            if (claimed) {
                previousStatus = DarknodeFeeStatus.CLAIMED;
            } else {
                previousStatus = DarknodeFeeStatus.NOT_CLAIMED;
            }
        }
    }
    // }

    let cycleStatus = OrderedMap<string, DarknodeFeeStatus>();
    if (currentCycleBN !== null) {
        cycleStatus = cycleStatus.set(currentCycleBN.toString(), currentStatus);
    }
    if (previousCycleBN !== null) {
        cycleStatus = cycleStatus.set(previousCycleBN.toString(), previousStatus);
    }

    // Call queryStats
    let nodeStatistics = null;
    try {
        nodeStatistics = await queryStat(getLightnode(renNetwork), darknodeIDHexToBase58(darknodeID));
    } catch (error) {
        console.error(error);
    }

    // Store details ///////////////////////////////////////////////////////////

    return new DarknodesState({
        ID: darknodeID,
        multiAddress: "" as string,
        publicKey,
        ethBalance,
        feesEarned,
        oldFeesEarned,
        feesEarnedTotalEth,

        cycleStatus,
        averageGasUsage: 0,
        lastTopUp: null,
        expectedExhaustion: null,
        peers: 0,
        registrationStatus,
        operator,

        nodeStatistics,
    });
};
