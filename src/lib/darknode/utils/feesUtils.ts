import BigNumber from "bignumber.js";
import { updatePrice } from "../../../controllers/common/tokenBalanceUtils";
import { FeeTokens, Token, TokenPrices } from "../../ethereum/tokens";
import { TokenAmount } from "../../graphQL/queries/queries";
import { queryBlockStateResponseMock } from "./currentMock";

export type QueryBlockStateResponse = typeof queryBlockStateResponseMock;

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

export const getFeesForAsset = (
    symbol: string,
    blockState: QueryBlockStateResponse,
) => {
    const data = blockState.result.state.v[symbol];
    if (!data) {
        return null;
    }
    return data.fees as FeeData;
};

export const getLastAssetEpochId = (
    symbol: string,
    blockState: QueryBlockStateResponse,
) => {
    const fees = getFeesForAsset(symbol, blockState);
    if (!fees || fees.epochs.length === 0) {
        return null;
    }
    const { epochs } = fees;
    return Number(epochs[epochs.length - 1].epoch);
};

export const getCurrentEpochId = (blockState: QueryBlockStateResponse) => {
    return Number(blockState.result.state.v.System.epoch.number);
};

// TODO: fees rename
export const getTokenRewardsForEpoch = (
    symbol: string,
    epoch: "current" | "previous" | number,
    blockState: QueryBlockStateResponse,
    perNode = false,
) => {
    const data = getFeesForAsset(symbol, blockState);
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

export const getNodeEnteredAt = (
    renVmNodeId: string,
    blockState: QueryBlockStateResponse,
) => {
    const nodeSystemData = blockState.result.state.v.System.nodes.find(
        (node) => node.id === renVmNodeId,
    );
    if (!nodeSystemData) {
        return null;
    }
    return Number(nodeSystemData.enteredAt);
};

export const getNodeExists = (
    renVmNodeId: string,
    blockState: QueryBlockStateResponse,
) => {
    return getNodeEnteredAt(renVmNodeId, blockState) !== null;
};

export const getNodeLastEpochClaimed = (
    renVmNodeId: string,
    symbol: string,
    blockState: QueryBlockStateResponse,
) => {
    const data = getFeesForAsset(symbol, blockState);
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
    blockState: QueryBlockStateResponse,
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
    blockState: QueryBlockStateResponse,
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
        return getTokenRewardsForEpoch(symbol, epoch, blockState, true);
    }
    return new BigNumber(0);
};

export const getNodeClaimableFees = (
    renVmNodeId: string,
    symbol: string,
    blockState: QueryBlockStateResponse,
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
        const fee = getTokenRewardsForEpoch(symbol, epoch, blockState, true);
        claimable = claimable.plus(fee);
    }

    return claimable;
};

export const getNodePendingFees = (
    renVmNodeId: string,
    symbol: string,
    blockState: QueryBlockStateResponse,
) => {
    const exists = getNodeEnteredAt(renVmNodeId, blockState);
    if (!exists) {
        return new BigNumber(0);
    }
    const epoch = getCurrentEpochId(blockState);
    return getTokenRewardsForEpoch(symbol, epoch, blockState, true);
};

export type FeeType = "claimable" | "pending";

export const getNodeFeesCollection = (
    renVmNodeId: string,
    blockState: QueryBlockStateResponse | null,
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
