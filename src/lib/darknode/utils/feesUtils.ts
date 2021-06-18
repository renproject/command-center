import BigNumber from "bignumber.js";
import { updatePrice } from "../../../controllers/common/tokenBalanceUtils";
import { FeeTokens, Token, TokenPrices } from "../../ethereum/tokens";
import { TokenAmount } from "../../graphQL/queries/queries";
import { queryBlockStateResponseMock } from "./currentMock";

export type QueryBlockStateResponse = typeof queryBlockStateResponseMock;
export type QueryBlockState = QueryBlockStateResponse["result"]["state"]["v"];

type Numeric = number | string;

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

export const getFeesForToken = (
    symbol: string,
    blockState: QueryBlockState,
) => {
    const data = blockState[symbol];
    if (!data) {
        return null;
    }
    return data.fees as FeeData;
};

export const getLastAssetEpochId = (
    symbol: string,
    blockState: QueryBlockState,
) => {
    const fees = getFeesForToken(symbol, blockState);
    if (!fees || fees.epochs.length === 0) {
        return null;
    }
    const { epochs } = fees;
    return Number(epochs[epochs.length - 1].epoch);
};

export const getCurrentEpochId = (blockState: QueryBlockState) => {
    return Number(blockState.System.epoch.number);
};

export const getTokenFeeForEpoch = (
    symbol: string,
    epoch: "current" | "previous" | number,
    blockState: QueryBlockState,
    perNode = false,
) => {
    const data = getFeesForToken(symbol, blockState);
    if (data === null) {
        return new BigNumber(0);
    }
    const { epochs } = data;
    const current = getCurrentEpochId(blockState);
    let epochIndex = 0;
    if (epoch === "current") {
        epochIndex = current;
    } else if (epoch === "previous") {
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

export const toNativeTokenSymbol = (symbol: string) => {
    return symbol.replace(/^ren/, "").replace(/^test/, "").replace(/^dev/, "");
};

// export const getNativeDecimals = (symbol: string) => {
//     AllTokenDetails;
// };

export const getNodeEnteredAt = (
    renVmNodeId: string,
    blockState: QueryBlockState,
) => {
    const nodeSystemData = blockState.System.nodes.find(
        (node) => node.id === renVmNodeId,
    );
    if (!nodeSystemData) {
        return null;
    }
    return Number(nodeSystemData.enteredAt);
};

export const getNodeExists = (
    renVmNodeId: string,
    blockState: QueryBlockState,
) => {
    return getNodeEnteredAt(renVmNodeId, blockState) !== null;
};

export const getNodeLastEpochClaimed = (
    renVmNodeId: string,
    symbol: string,
    blockState: QueryBlockState,
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
    blockState: QueryBlockState,
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
    blockState: QueryBlockState,
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
    blockState: QueryBlockState,
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
    blockState: QueryBlockState,
) => {
    const exists = getNodeEnteredAt(renVmNodeId, blockState);
    if (!exists) {
        return new BigNumber(0);
    }
    const epoch = getCurrentEpochId(blockState);
    return getTokenFeeForEpoch(symbol, epoch, blockState, true);
};

export type FeeType = "claimable" | "pending";

export const getNodeFeesCollection = (
    renVmNodeId: string,
    blockState: QueryBlockState | null,
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
    blockState: QueryBlockState | null,
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
    blockState: QueryBlockState | null,
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

export const getAggregatedFeesCollection = (
    blockState: QueryBlockState | null,
) => {
    return FeeTokens.mapEntries(([symbol, token]) => {
        const amount = getAggregatedFeeAmountForToken(symbol, blockState);
        const tokenAmount = toTokenAmount(amount, token.symbol, token.decimals);
        return [symbol, tokenAmount];
    });
};
