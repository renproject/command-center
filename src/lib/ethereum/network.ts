import { mainnet, RenNetworkDetails } from "@renproject/contracts";
import { Currency } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import { List, OrderedMap } from "immutable";
import Web3 from "web3";
import { Block } from "web3-eth";
import { toChecksumAddress } from "web3-utils";

import { DarknodesState } from "../../store/applicationState";
import { DarknodeFeeStatus } from "../darknodeFeeStatus";
import { DarknodePaymentWeb3 } from "../ethereum/contracts/bindings/darknodePayment";
import { DarknodePaymentStoreWeb3 } from "../ethereum/contracts/bindings/darknodePaymentStore";
import { DarknodeRegistryWeb3 } from "../ethereum/contracts/bindings/darknodeRegistry";
import { NewTokenDetails, OldToken, OldTokenDetails, Token } from "../ethereum/tokens";
import { _captureBackgroundException_, _noCapture_ } from "../react/errors";
import { TokenPrices } from "../tokenPrices";

export const getMinimumBond = async (web3: Web3, renNetwork: RenNetworkDetails) => {
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodeRegistry.abi,
        renNetwork.addresses.ren.DarknodeRegistry.address
    );
    const minimumBond = (await darknodeRegistry.methods.minimumBond().call()) || "100000000000000000000000";
    return new BigNumber((minimumBond).toString());
};

// export const getDarknodeCount = async (web3: Web3, renNetwork: RenNetworkDetails): Promise<BigNumber> => {
//     const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
//         renNetwork.addresses.ren.DarknodeRegistry.abi,
//         renNetwork.addresses.ren.DarknodeRegistry.address
//     );
//     const darknodeCount = await darknodeRegistry.methods.numDarknodes().call();
//     if (darknodeCount === null) {
//         throw _noCapture_(new Error("Unable to retrieve darknode count"));
//     }
//     return new BigNumber(darknodeCount.toString());
// };

export enum RegistrationStatus {
    Unknown = "",
    Unregistered = "unregistered",
    RegistrationPending = "registration pending",
    Registered = "registered",
    DeregistrationPending = "deregistration pending",
    Deregistered = "awaiting refund period",
    Refundable = "refundable",
}

export const getDarknodeStatus = async (web3: Web3, renNetwork: RenNetworkDetails, darknodeID: string): Promise<RegistrationStatus> => {
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodeRegistry.abi,
        renNetwork.addresses.ren.DarknodeRegistry.address
    );

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

// FIXME: safePromiseAllList still throws uncaught error
// The same as Promise.all except that if an entry throws, it sets it to the
// provided default value instead of throwing the entire promise.
const safePromiseAllList = async <b>(orderedMap: List<Promise<b>>, defaultValue: b): Promise<List<b>> => {
    let newOrderedMap = List<b>();
    for (const valueP of orderedMap.toArray()) {
        try {
            newOrderedMap = newOrderedMap.push(await valueP);
        } catch (error) {
            console.error(error);
            newOrderedMap = newOrderedMap.push(defaultValue);
        }
    }
    return newOrderedMap;
};

// The same as Promise.all except that if an entry throws, it sets it to the
// provided default value instead of throwing the entire promise.
// This variation maps over an OrderedMap instead of an array.
const safePromiseAllMap = async <a, b>(orderedMap: OrderedMap<a, Promise<b>>, defaultValue: b): Promise<OrderedMap<a, b>> => {
    let newOrderedMap = OrderedMap<a, b>();
    for (const [key, valueP] of orderedMap.toArray()) {
        try {
            newOrderedMap = newOrderedMap.set(key, await valueP);
        } catch (error) {
            console.error(error);
            newOrderedMap = newOrderedMap.set(key, defaultValue);
        }
    }
    return newOrderedMap;
};

const getBalances = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    darknodeID: string,
): Promise<OrderedMap<Token, BigNumber>> => {

    const contract: DarknodePaymentWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodePayment.abi,
        renNetwork.addresses.ren.DarknodePayment.address,
    );

    let feesEarned = OrderedMap<Token, BigNumber>();

    // const address = (await web3.eth.getAccounts())[0];

    const balances = await safePromiseAllList(
        NewTokenDetails.map(async (_tokenDetails, token) => {
            let balance1;
            try {
                const balance1Call = await contract.methods.darknodeBalances(darknodeID, renNetwork.addresses.tokens[token]).call();
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

export const sumUpFeeMap = (
    feesEarned: OrderedMap<Token | OldToken, BigNumber>,
    tokenPrices: TokenPrices,
): BigNumber => {

    let totalEth = new BigNumber(0);

    NewTokenDetails.map((tokenDetails, token) => {
        const price = tokenPrices.get(token, undefined);
        const decimals = tokenDetails ? new BigNumber(tokenDetails.decimals.toString()).toNumber() : 0;
        const inEth = feesEarned.get(token, new BigNumber(0))
            .div(Math.pow(10, decimals))
            .multipliedBy(price ? price.get(Currency.ETH, 0) : 0);
        totalEth = totalEth.plus(inEth);
        return null;
    });

    // Convert to wei
    return totalEth.multipliedBy(new BigNumber(10).pow(18));
};

const sumUpFees = (
    feesEarned: OrderedMap<Token, BigNumber>,
    oldFeesEarned: OrderedMap<OldToken, BigNumber>,
    tokenPrices: TokenPrices,
): BigNumber => {
    return sumUpFeeMap(feesEarned, tokenPrices).plus(sumUpFeeMap(oldFeesEarned, tokenPrices));
};

const getDarknodePublicKey = async (web3: Web3, renNetwork: RenNetworkDetails, darknodeID: string): Promise<string> => {
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodeRegistry.abi,
        renNetwork.addresses.ren.DarknodeRegistry.address
    );
    const publicKey = await darknodeRegistry.methods.getDarknodePublicKey(darknodeID).call();
    if (publicKey === null) {
        throw _noCapture_(new Error("Unable to retrieve darknode public key"));
    }
    return publicKey;
};

const getDarknodeOperator = async (web3: Web3, renNetwork: RenNetworkDetails, darknodeID: string): Promise<string> => {
    const darknodeRegistry: DarknodeRegistryWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodeRegistry.abi,
        renNetwork.addresses.ren.DarknodeRegistry.address
    );
    const owner = await darknodeRegistry.methods.getDarknodeOwner(darknodeID).call();
    if (owner === null) {
        throw _noCapture_(new Error("Unable to retrieve darknode owner"));
    }
    return owner;
};

export const fetchDarknodeStatistics = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    darknodeID: string,
    tokenPrices: TokenPrices | null,
) => {
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
        feesEarnedTotalEth = sumUpFees(feesEarned, oldFeesEarned, tokenPrices);
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

    const darknodePayment: DarknodePaymentWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodePayment.abi,
        renNetwork.addresses.ren.DarknodePayment.address,
    );

    const darknodePaymentStore: DarknodePaymentStoreWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodePaymentStore.abi,
        renNetwork.addresses.ren.DarknodePaymentStore.address,
    );

    const currentCycleBN = await darknodePayment.methods.currentCycle().call();
    const previousCycleBN = await darknodePayment.methods.previousCycle().call();
    const blacklisted = await darknodePaymentStore.methods.isBlacklisted(darknodeID).call();
    let currentStatus;
    let previousStatus;
    if (blacklisted) {
        currentStatus = DarknodeFeeStatus.BLACKLISTED;
        previousStatus = DarknodeFeeStatus.BLACKLISTED;
    } else {
        const whitelistedTimeCall = await darknodePaymentStore.methods.darknodeWhitelist(darknodeID).call();
        const whitelistedTime = whitelistedTimeCall === null ? new BigNumber(0) : new BigNumber(whitelistedTimeCall.toString());
        if (whitelistedTime.isZero()) {
            currentStatus = DarknodeFeeStatus.NOT_WHITELISTED;
            previousStatus = DarknodeFeeStatus.NOT_WHITELISTED;
        } else {
            currentStatus = DarknodeFeeStatus.NOT_CLAIMED;
            const cycleStartTimeBN = await darknodePayment.methods.cycleStartTime().call();
            if (!cycleStartTimeBN || whitelistedTime.gte(cycleStartTimeBN.toString())) {
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
        }
    }

    let cycleStatus = OrderedMap<string, DarknodeFeeStatus>();
    if (currentCycleBN !== null) {
        cycleStatus = cycleStatus.set(currentCycleBN.toString(), currentStatus);
    }
    if (previousCycleBN !== null) {
        cycleStatus = cycleStatus.set(previousCycleBN.toString(), previousStatus);
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
    });
};

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

export enum HistoryPeriods {
    Day = 60 * 60 * 24,
    Week = Day * 7,
    Month = Week * 4,
    HalfYear = Week * 26,
    Year = Week * 52,
}

export const fetchDarknodeBalanceHistory = async (
    web3: Web3,
    darknodeID: string,
    previousHistory: OrderedMap<number, BigNumber> | null,
    historyPeriod: HistoryPeriods,
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

export const fetchCycleAndPendingRewards = async (
    web3: Web3,
    renNetwork: RenNetworkDetails,
    tokenPrices: TokenPrices | null,
) => {
    const darknodePayment: DarknodePaymentWeb3 = new (web3.eth.Contract)(
        renNetwork.addresses.ren.DarknodePayment.abi,
        renNetwork.addresses.ren.DarknodePayment.address,
    );

    let pendingRewards = OrderedMap<string /* cycle */, OrderedMap<Token, BigNumber>>();

    const currentCycle = await darknodePayment.methods.currentCycle().call();
    const previousCycle = await darknodePayment.methods.previousCycle().call();

    const previous = await safePromiseAllMap(
        NewTokenDetails.map(async (_tokenDetails, token) => {
            try {
                const previousCycleRewardShareBN = await darknodePayment.methods.previousCycleRewardShare((token)).call();
                if (previousCycleRewardShareBN === null) {
                    return new BigNumber(0);
                }
                return new BigNumber(previousCycleRewardShareBN.toString());
            } catch (error) {
                return new BigNumber(0);
            }
        }).toOrderedMap(),
        new BigNumber(0),
    );
    if (previousCycle !== null) {
        pendingRewards = pendingRewards.set(previousCycle.toString(), previous);
    }

    const currentShareCountBN = await darknodePayment.methods.shareCount().call();
    const current = await safePromiseAllMap(
        NewTokenDetails.map(async (_tokenDetails, token) => {
            if (currentShareCountBN === null) {
                return new BigNumber(0);
            }
            const currentShareCount = new BigNumber(currentShareCountBN.toString());
            try {
                if (currentShareCount.isZero()) {
                    return new BigNumber(0);
                }
                const currentCycleRewardPool = await darknodePayment.methods.currentCycleRewardPool(renNetwork.addresses.tokens[token]).call();
                if (currentCycleRewardPool === null) {
                    return new BigNumber(0);
                }
                return new BigNumber((currentCycleRewardPool).toString()).div(currentShareCount);
            } catch (error) {
                return new BigNumber(0);
            }
        }
        ).toOrderedMap(),
        new BigNumber(0),
    );
    if (currentCycle !== null) {
        pendingRewards = pendingRewards.set(currentCycle.toString(), current);
    }

    const cycleTimeoutBN = (await darknodePayment.methods.cycleTimeout().call());

    let pendingTotalInEth = null;
    if (tokenPrices) {
        const previousTotal = sumUpFeeMap(previous, tokenPrices);
        const currentTotal = sumUpFeeMap(current, tokenPrices);
        pendingTotalInEth = OrderedMap<string /* cycle */, BigNumber>();
        if (previousCycle !== null) {
            pendingTotalInEth = pendingTotalInEth.set(previousCycle.toString(), previousTotal);
        }
        if (currentCycle !== null) {
            pendingTotalInEth = pendingTotalInEth.set(currentCycle.toString(), currentTotal);
        }
    }

    return {
        pendingRewards,
        currentCycle,
        previousCycle,
        cycleTimeoutBN,
        pendingTotalInEth,
    };
};
