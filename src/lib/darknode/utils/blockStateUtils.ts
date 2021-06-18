import { queryBlockStateResponseMock } from "./currentMock";

export type QueryBlockStateResponse = typeof queryBlockStateResponseMock;
export type BlockState = QueryBlockStateResponse["result"]["state"]["v"];
export type Numeric = number | string;

export const getCurrentEpochId = (blockState: BlockState) => {
    return Number(blockState.System.epoch.number);
};

export const toNativeTokenSymbol = (symbol: string) => {
    return symbol.replace(/^ren/, "").replace(/^test/, "").replace(/^dev/, "");
};

export const getNodeEnteredAt = (
    renVmNodeId: string,
    blockState: BlockState,
) => {
    const nodeSystemData = blockState.System.nodes.find(
        (node) => node.id === renVmNodeId,
    );
    if (!nodeSystemData) {
        return null;
    }
    return Number(nodeSystemData.enteredAt);
};

export const getNodeExists = (renVmNodeId: string, blockState: BlockState) => {
    return getNodeEnteredAt(renVmNodeId, blockState) !== null;
};
