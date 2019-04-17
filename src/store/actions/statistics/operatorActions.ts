import BigNumber from "bignumber.js";
import Web3 from "web3";

import { List, OrderedMap, OrderedSet } from "immutable";
import { Dispatch } from "redux";
import { createStandardAction } from "typesafe-actions";
import { Block } from "web3-eth";
import { toChecksumAddress } from "web3-utils";

import { getOperatorDarknodes } from "../../../lib/ethereum/operator";
import { Currency, DarknodeDetails, TokenPrices } from "../../types";

import { _captureBackgroundException_ } from "../../../lib/errors";
import { contracts } from "../../../lib/ethereum/contracts/contracts";
import { Token, TokenDetails } from "../../../lib/ethereum/tokens";

export const addRegisteringDarknode = createStandardAction("ADD_REGISTERING_DARKNODE")<{
    darknodeID: string;
    publicKey: string;
}>();

export const removeRegisteringDarknode = createStandardAction("REMOVE_REGISTERING_DARKNODE")<{
    darknodeID: string;
}>();

export const removeDarknode = createStandardAction("REMOVE_DARKNODE")<{
    darknodeID: string;
    operator: string;
}>();

export const storeDarknodeList = createStandardAction("STORE_DARKNODE_LIST")<{
    darknodeList: OrderedSet<string>;
    address: string;
}>();

export const storeQuoteCurrency = createStandardAction("SORE_QUOTE_CURRENCY")<{ quoteCurrency: Currency }>();

export const storeSecondsPerBlock = createStandardAction("SORE_BLOCKS_PER_SECOND")<{ secondsPerBlock: number }>();

export const setDarknodeDetails = createStandardAction("UPDATE_DARKNODE_DETAILS")<{
    darknodeDetails: DarknodeDetails;
}>();

export const updateDarknodeHistory = createStandardAction("UPDATE_DARKNODE_HISTORY")<{
    darknodeID: string;
    balanceHistory: OrderedMap<number, BigNumber>;
}>();

export const setDarknodeName = createStandardAction("UPDATE_DARKNODE_NAME")<{ darknodeID: string; name: string }>();

export const calculateSecondsPerBlock = (
    web3: Web3,
) => async (dispatch: Dispatch) => {
    const sampleSize = 1000;

    const fetchedBlockNumber = await web3.eth.getBlockNumber();
    let currentBlockNumber = fetchedBlockNumber;
    let currentBlock: Block | null = null;
    // If current block isn't know yet, try previous block, up to 10 times
    while (currentBlock === null && currentBlockNumber > fetchedBlockNumber - 10) {
        currentBlock = await web3.eth.getBlock(currentBlockNumber);
        currentBlockNumber -= 1;
    }
    const previousBlock = await web3.eth.getBlock(currentBlockNumber - sampleSize);

    if (currentBlock !== null && previousBlock !== null) {
        const secondsPerBlock = Math.floor((currentBlock.timestamp - previousBlock.timestamp) / sampleSize);

        dispatch(storeSecondsPerBlock({ secondsPerBlock }));
    }
};

const getBalances = async (web3: Web3, darknodeID: string): Promise<OrderedMap<Token, BigNumber>> => {

    const contract = new (web3.eth.Contract)(
        contracts.DarknodeRewardVault.ABI,
        contracts.DarknodeRewardVault.address,
    );

    let feesEarned = OrderedMap<Token, BigNumber>();

    const balances = TokenDetails.map(async (tokenDetails, token) => {
        const balance = new BigNumber(await contract.methods.darknodeBalances(darknodeID, tokenDetails.address).call());

        return {
            balance,
            token,
        };
    }).valueSeq();
    const res = await Promise.all(balances);

    for (const { balance, token } of res) {
        feesEarned = feesEarned.set(token, balance);
    }

    return feesEarned;
};

const sumUpFees = async (
    feesEarned: OrderedMap<Token, BigNumber>,
    tokenPrices: TokenPrices,
): Promise<BigNumber> => {

    let totalEth = new BigNumber(0);

    TokenDetails.map((tokenDetails, token) => {
        const price = tokenPrices.get(token, undefined);
        const decimals = tokenDetails ? new BigNumber(tokenDetails.decimals.toString()).toNumber() : 0;
        const inEth = feesEarned.get(token, new BigNumber(0))
            .div(Math.pow(10, decimals))
            .multipliedBy(price ? price.get(Currency.ETH, 0) : 0);
        totalEth = totalEth.plus(inEth);
    });

    // Convert to wei
    return totalEth.multipliedBy(new BigNumber(10).pow(18));
};

const getDarknodeOperator = async (web3: Web3, darknodeID: string): Promise<string> => {
    const darknodeRegistry = new (web3.eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );
    return darknodeRegistry.methods.getDarknodeOwner(darknodeID).call();
};

const getDarknodePublicKey = async (web3: Web3, darknodeID: string): Promise<string> => {
    const darknodeRegistry = new (web3.eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );
    return darknodeRegistry.methods.getDarknodePublicKey(darknodeID).call();
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

const getDarknodeStatus = async (web3: Web3, darknodeID: string): Promise<RegistrationStatus> => {
    const darknodeRegistry = new (web3.eth.Contract)(
        contracts.DarknodeRegistry.ABI,
        contracts.DarknodeRegistry.address
    );

    try {
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
    } catch (error) {
        _captureBackgroundException_(error, {
            description: "Unknown darknode registration status",
        });
        return RegistrationStatus.Unknown;
    }

};

export const updateDarknodeStatistics = (
    web3: Web3,
    darknodeID: string,
    tokenPrices: TokenPrices | null,
) => async (dispatch: Dispatch) => {
    darknodeID = toChecksumAddress(darknodeID.toLowerCase());

    // Get eth Balance
    const ethBalanceBN = await web3.eth.getBalance(darknodeID);

    let ethBalance = new BigNumber(0);
    if (ethBalanceBN) {
        ethBalance = new BigNumber(ethBalanceBN.toString());
    }

    // Get earned fees
    const feesEarned = await getBalances(web3, darknodeID);
    let feesEarnedTotalEth = new BigNumber(0);
    if (tokenPrices) {
        feesEarnedTotalEth = await sumUpFees(feesEarned, tokenPrices);
    }

    // Get darknode operator and public key
    const operator = await getDarknodeOperator(web3, darknodeID);
    const publicKey = await getDarknodePublicKey(web3, darknodeID);

    // Get registration status
    const registrationStatus = await getDarknodeStatus(web3, darknodeID);

    const darknodeDetails = new DarknodeDetails({
        ID: darknodeID,
        multiAddress: "" as string,
        publicKey,
        ethBalance,
        feesEarned,
        feesEarnedTotalEth,

        averageGasUsage: 0,
        lastTopUp: null,
        expectedExhaustion: null,

        peers: 0,
        registrationStatus,
        operator,
    });

    dispatch(setDarknodeDetails({ darknodeDetails }));
};

export const updateOperatorStatistics = (
    web3: Web3,
    address: string,
    tokenPrices: TokenPrices | null,
    previousDarknodeList: List<string> | null,
) => async (dispatch: Dispatch) => {

    let darknodeList = previousDarknodeList || List<string>();

    const currentDarknodes = await getOperatorDarknodes(web3, address);
    dispatch(storeDarknodeList({ darknodeList: currentDarknodes, address }));

    // The lists are merged in the reducer as well, but we combine them again
    // before passing into `updateDarknodeStatistics`
    currentDarknodes.map((darknodeID: string) => {
        if (!darknodeList.contains(darknodeID)) {
            darknodeList = darknodeList.push(darknodeID);
        }
    });

    await Promise.all(darknodeList.toList().map(async (darknodeID: string) => {
        return updateDarknodeStatistics(web3, darknodeID, tokenPrices)(dispatch);
    }).toArray());
};

export const HistoryIterations = 5;

export enum HistoryPeriods {
    Day = 60 * 60 * 24,
    Week = Day * 7,
    Month = Week * 4,
    HalfYear = Week * 26,
    Year = Week * 52,
}

export const fetchDarknodeBalanceHistory = (
    web3: Web3,
    darknodeID: string,
    previousHistory: OrderedMap<number, BigNumber> | null,
    historyPeriod: HistoryPeriods,
    secondsPerBlock: number,
) => async (dispatch: Dispatch) => {
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
            const blockBalance = await web3.eth.getBalance(darknodeID, block);

            if (blockBalance !== null) {
                const balance = new BigNumber(blockBalance.toString());
                balanceHistory = balanceHistory.set(block, balance);
            }
        }
    }

    // Also add most recent block
    if (!balanceHistory.has(currentBlock)) {
        const currentBalance = await web3.eth.getBalance(darknodeID, currentBlock);

        if (currentBalance !== null) {
            const balance = new BigNumber(currentBalance.toString());
            balanceHistory = balanceHistory.set(currentBlock, balance);
        }
    }

    balanceHistory = balanceHistory.sortBy((_: BigNumber, value: number) => value);

    dispatch(updateDarknodeHistory({ darknodeID, balanceHistory }));
};
