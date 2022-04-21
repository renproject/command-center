import BigNumber from "bignumber.js";
import { updatePrice } from "../../../controllers/common/tokenBalanceUtils";
import { FeeTokens, Token, TokenPrices, AllTokenDetails } from "../../ethereum/tokens";
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
    amountClaimed: Numeric;
    nonce: Numeric;
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
    reserved: {
        fund: Numeric;
    };
};

export const getClaimFeeForToken = (symbol: string, blockState: BlockState) => {
    const data = blockState[symbol];
    if (!data) {
        return new BigNumber(-1);
    }
    const { gasLimit, gasCap, dustAmount } = data;

    let fee = new BigNumber(gasLimit)
        .times(new BigNumber(gasCap))
        // RenVM subtracts `dustAmount + 1` to ensure the change back to itself
        // is greater than the dust amount.
        .plus(dustAmount)
        .plus(1);
    const feeDivisor = AllTokenDetails.get(Token[symbol])?.feeDivisor;
    if(feeDivisor) {
        fee =  fee.div(new BigNumber(Math.pow(10, feeDivisor)));
    }
    return fee;
};

export const getMinimumAmountForToken = (
    symbol: string,
    blockState: BlockState,
) => {
    const data = blockState[symbol];
    if (!data) {
        return new BigNumber(-1);
    }
    const { minimumAmount } = data;
    const fee = getClaimFeeForToken(symbol, blockState);
    const feeDivisor = AllTokenDetails.get(Token[symbol])?.feeDivisor;
    return feeDivisor ?
        fee.plus(minimumAmount).div(new BigNumber(Math.pow(10, feeDivisor))) :
        fee.plus(minimumAmount);
};

export const getFeeDataForToken = (symbol: string, blockState: BlockState) => {
    const data = blockState[symbol];
    if (!data) {
        return null;
    }
    return data.fees as FeeData;
};

const DARKNODE_PAYOUT_PERCENT = 0.46435;

export const getTokenFeeForEpoch = (
    symbol: string,
    epoch: "current" | "previous" | number,
    blockState: BlockState,
    perNode = false,
) => {
    if (epoch === "current") {
        return getTokenUnassignedFees(symbol, blockState, perNode).times(
            DARKNODE_PAYOUT_PERCENT,
        );
    }
    const data = getFeeDataForToken(symbol, blockState);
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
        return new BigNumber(amount)
            .div(perNode ? numNodes : 1)
            .integerValue(BigNumber.ROUND_DOWN);
    }
    return new BigNumber(0);
};

const toTokenAmount = (amount: BigNumber, symbol: string, decimals: number) => {
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

export const getNodeLastNonceClaimed = (
    renVmNodeId: string,
    symbol: string,
    blockState: BlockState,
) => {
    const exists = getNodeExists(renVmNodeId, blockState);
    if (!exists) {
        return null;
    }
    const feesData = getFeeDataForToken(symbol, blockState);
    if (!feesData) {
        return null;
    }
    const nodeData = feesData.nodes.find(
        (nodeItem) => nodeItem.node === renVmNodeId,
    );
    if (nodeData && nodeData.nonce) {
        return Number(nodeData.nonce);
    }
    return -1;
};

export const getTokenUnassignedFees = (
    symbol: string,
    blockState: BlockState,
    perNode = false,
) => {
    const data = getFeeDataForToken(symbol, blockState);
    if (data === null) {
        return new BigNumber(0);
    }
    const { unassigned } = data;
    if (perNode) {
        const numNodes = blockState.System.epoch.numNodes;
        return new BigNumber(unassigned)
            .div(numNodes)
            .integerValue(BigNumber.ROUND_DOWN);
    }
    return new BigNumber(unassigned);
};

export const getNodePendingFee = (
    renVmNodeId: string,
    symbol: string,
    blockState: BlockState,
) => {
    const exists = getNodeExists(renVmNodeId, blockState);
    if (!exists) {
        return new BigNumber(0);
    }
    return getTokenUnassignedFees(symbol, blockState, true).times(
        DARKNODE_PAYOUT_PERCENT,
    ); // 50% assigned to next epoch
};

export const getNodeClaimedFee = (
    renVmNodeId: string,
    symbol: string,
    blockState: BlockState,
) => {
    const exists = getNodeExists(renVmNodeId, blockState);
    if (!exists) {
        return new BigNumber(0);
    }
    const feesData = getFeeDataForToken(symbol, blockState);
    if (!feesData) {
        return new BigNumber(0);
    }
    const nodeData = feesData.nodes.find(
        (nodeItem) => nodeItem.node === renVmNodeId,
    );
    if (nodeData && nodeData.amountClaimed) {
        return new BigNumber(nodeData.amountClaimed);
    }
    return new BigNumber(0);
};

export const getNodeTotalFee = (
    renVmNodeId: string,
    symbol: string,
    blockState: BlockState,
) => {
    const exists = getNodeExists(renVmNodeId, blockState);
    if (!exists) {
        return new BigNumber(0);
    }
    const startEpoch = getNodeEnteredAt(renVmNodeId, blockState);
    const feesData = getFeeDataForToken(symbol, blockState);
    if (!feesData || !startEpoch) {
        return new BigNumber(0);
    }
    const currentEpoch = getCurrentEpochId(blockState);

    let claimable = new BigNumber(0);
    for (let epoch = startEpoch; epoch < currentEpoch; epoch++) {
        const fee = getTokenFeeForEpoch(symbol, epoch, blockState, true);
        claimable = claimable.plus(fee);
    }

    return claimable;
};

export const getNodeClaimableFee = (
    renVmNodeId: string,
    symbol: string,
    blockState: BlockState,
) => {
    const claimed = getNodeClaimedFee(renVmNodeId, symbol, blockState);
    if (claimed === null) {
        return new BigNumber(0);
    }
    const total = getNodeTotalFee(renVmNodeId, symbol, blockState);
    if (total === null) {
        return new BigNumber(0);
    }

    return total.minus(claimed);
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
                    ? getNodeClaimableFee(renVmNodeId, symbol, blockState)
                    : getNodePendingFee(renVmNodeId, symbol, blockState);
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

export const getFundCollection = (blockState: BlockState | null) => {
    return FeeTokens.mapEntries(([symbol, token]) => {
        let amount = new BigNumber(0);
        if (blockState !== null) {
            const data = getFeeDataForToken(symbol, blockState);
            if (data && data.reserved) {
                amount = new BigNumber(data.reserved.fund);
            }
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
        const fees = getFeeDataForToken(symbol, blockState);
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
