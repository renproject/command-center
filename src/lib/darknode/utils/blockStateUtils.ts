import { queryBlockStateResponseMock } from "./currentMock";

export type QueryBlockStateResponse = typeof queryBlockStateResponseMock;
export type QueryBlockState = QueryBlockStateResponse["result"]["state"]["v"];
export type Numeric = number | string;
export const getCurrentEpochId = (blockState: QueryBlockState) => {
    return Number(blockState.System.epoch.number);
};
export const toNativeTokenSymbol = (symbol: string) => {
    return symbol.replace(/^ren/, "").replace(/^test/, "").replace(/^dev/, "");
};
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
