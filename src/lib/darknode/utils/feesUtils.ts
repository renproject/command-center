import BigNumber from "bignumber.js";
import { updatePrice } from "../../../controllers/common/tokenBalanceUtils";
import { FeeTokens, Token, TokenPrices } from "../../ethereum/tokens";
import { TokenAmount } from "../../graphQL/queries/queries";
import {
    BlockState,
    getCurrentEpochId,
    getNodeEnteredAt,
    getNodeExists,
    Numeric,
} from "./blockStateUtils";

type FeeNode = {
    node: string;
    lastEpochClaimed: Numeric;
};

type FeeEpoch = {
    amount: Numeric;
    epoch: Numeric;
    numNodes: Numeric;
};

type FeeData = {
    nodes: FeeNode[];
    epochs: FeeEpoch[];
    unassigned: Numeric;
};

export const getFeesForToken = (symbol: string, blockState: BlockState) => {
    const data = blockState[symbol];
    if (!data) {
        return null;
    }
    return data.fees as FeeData;
};

export const getLastAssetEpochId = (symbol: string, blockState: BlockState) => {
    const fees = getFeesForToken(symbol, blockState);
    if (!fees || fees.epochs.length === 0) {
        return null;
    }
    const { epochs } = fees;
    return Number(epochs[epochs.length - 1].epoch);
};

export const getTokenFeeForEpoch = (
    symbol: string,
    epoch: "current" | "previous" | number,
    blockState: BlockState,
    perNode = false,
) => {
    if (epoch === "current") {
        return getTokenUnassignedFees(symbol, blockState, perNode).div(2);
    }
    const data = getFeesForToken(symbol, blockState);
    if (data === null) {
        return new BigNumber(0);
    }
    const { epochs } = data;
    const current = getCurrentEpochId(blockState);
    let epochIndex = 0;

    if (epoch === "previous") {
        epochIndex = current - 1;
    } else {
        epochIndex = epoch;
    }

    const epochEntry = epochs.find(
        (entry) => Number(entry.epoch) === epochIndex,
    );
    if (epochEntry) {
        const { amount, numNodes } = epochEntry;
        return new BigNumber(amount).div(perNode ? numNodes : 1);
    }
    return new BigNumber(0);
};

export const getTokenUnassignedFees = (
    symbol: string,
    blockState: BlockState,
    perNode = false,
) => {
    const data = getFeesForToken(symbol, blockState);
    if (data === null) {
        return new BigNumber(0);
    }
    const { unassigned } = data;
    if (perNode) {
        const numNodes = blockState.System.epoch.numNodes;
        return new BigNumber(unassigned).div(numNodes);
    }
    return new BigNumber(unassigned);
};

export const toTokenAmount = (
    amount: BigNumber,
    symbol: string,
    decimals: number,
) => {
    const data: TokenAmount = {
        amount: amount,
        amountInEth: new BigNumber(0),
        amountInUsd: new BigNumber(0),
        asset: { decimals },
        symbol,
    };
    return data;
};

export const getTokenFeeAmounts = (
    // eslint-disable-next-line
    amount: any,
    symbol: string,
    decimals: number,
    tokenPrices: TokenPrices | null,
) => {
    const data: TokenAmount = {
        amount: amount,
        amountInEth: new BigNumber(0),
        amountInUsd: new BigNumber(0),
        asset: { decimals },
        symbol,
    };
    if (tokenPrices) {
        return updatePrice(data, symbol as Token, tokenPrices);
    }
    return data;
};

// export const getNativeDecimals = (symbol: string) => {
//     AllTokenDetails;
// };

export const getNodeLastEpochClaimed = (
    renVmNodeId: string,
    symbol: string,
    blockState: BlockState,
) => {
    const data = getFeesForToken(symbol, blockState);
    if (!data) {
        return null;
    }
    const nodeData = data.nodes.find(
        (nodeItem) => nodeItem.node === renVmNodeId,
    );
    if (!nodeData) {
        return null;
    }
    return Number(nodeData.lastEpochClaimed) || null;
};

export const getNodeFirstClaimableEpoch = (
    renVmNodeId: string,
    symbol: string,
    blockState: BlockState,
) => {
    const lastClaimed = getNodeLastEpochClaimed(
        renVmNodeId,
        symbol,
        blockState,
    );
    if (lastClaimed !== null) {
        return lastClaimed + 1;
    }
    const enteredAt = getNodeEnteredAt(renVmNodeId, blockState);
    if (enteredAt !== null) {
        return enteredAt; // TODO: is it inclusive?
    }
    return null; // TODO: is it possible?
};

export const getNodeClaimableFeeForEpoch = (
    renVmNodeId: string,
    symbol: string,
    epoch: number,
    blockState: BlockState,
) => {
    const startEpoch = getNodeFirstClaimableEpoch(
        renVmNodeId,
        symbol,
        blockState,
    );

    if (startEpoch === null) {
        return new BigNumber(0);
    }
    if (epoch >= startEpoch) {
        return getTokenFeeForEpoch(symbol, epoch, blockState, true);
    }
    return new BigNumber(0);
};

export const getNodeClaimableFees = (
    renVmNodeId: string,
    symbol: string,
    blockState: BlockState,
) => {
    const startEpoch = getNodeFirstClaimableEpoch(
        renVmNodeId,
        symbol,
        blockState,
    );
    if (startEpoch === null) {
        return new BigNumber(0);
    }
    const lastClaimableEpoch = getCurrentEpochId(blockState) - 1;
    if (!lastClaimableEpoch) {
        return new BigNumber(0);
    }

    let claimable = new BigNumber(0);
    for (let epoch = startEpoch; epoch <= lastClaimableEpoch; epoch++) {
        const fee = getTokenFeeForEpoch(symbol, epoch, blockState, true);
        claimable = claimable.plus(fee);
    }

    return claimable;
};

export const getNodePendingFees = (
    renVmNodeId: string,
    symbol: string,
    blockState: BlockState,
) => {
    const exists = getNodeExists(renVmNodeId, blockState);
    if (!exists) {
        return new BigNumber(0);
    }
    return getTokenUnassignedFees(symbol, blockState, true).div(2); // 50% assigned to next epoch
};

export type FeeType = "claimable" | "pending";

export const getNodeFeesCollection = (
    renVmNodeId: string,
    blockState: BlockState | null,
    type: FeeType,
) => {
    return FeeTokens.mapEntries(([symbol, token]) => {
        let amount = new BigNumber(0);
        if (blockState !== null) {
            amount =
                type === "claimable"
                    ? getNodeClaimableFees(renVmNodeId, symbol, blockState)
                    : getNodePendingFees(renVmNodeId, symbol, blockState);
        }
        const tokenAmount = toTokenAmount(amount, token.symbol, token.decimals);
        return [symbol, tokenAmount];
    });
};

export const getFeesCollection = (
    epoch: "current" | "previous" | number,
    blockState: BlockState | null,
) => {
    return FeeTokens.mapEntries(([symbol, token]) => {
        let amount = new BigNumber(0);
        if (blockState !== null) {
            amount = getTokenFeeForEpoch(symbol, epoch, blockState);
        }
        const tokenAmount = toTokenAmount(amount, token.symbol, token.decimals);
        return [symbol, tokenAmount];
    });
};

export const getAggregatedFeeAmountForToken = (
    symbol: string,
    blockState: BlockState | null,
) => {
    let amount = new BigNumber(0);
    if (blockState !== null) {
        const fees = getFeesForToken(symbol, blockState);
        if (fees && fees.epochs.length) {
            amount = fees.epochs.reduce(
                (sum, epoch) => sum.plus(epoch.amount),
                new BigNumber(0),
            );
        }
    }
    return amount;
};

export const getAggregatedFeesCollection = (blockState: BlockState | null) => {
    return FeeTokens.mapEntries(([symbol, token]) => {
        const amount = getAggregatedFeeAmountForToken(symbol, blockState);
        const tokenAmount = toTokenAmount(amount, token.symbol, token.decimals);
        return [symbol, tokenAmount];
    });
};
