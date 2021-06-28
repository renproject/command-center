import BigNumber from "bignumber.js";
import { RenVM } from "../../graphQL/queries/renVM";
import { BlockState } from "./blockStateUtils";

const renVMFallback: Partial<RenVM> = {
    assets: [],
    btcBurnFee: 0,
    btcMintFee: 0,
    currentCycle: "",
    // currentEpoch: undefined,
    // cycleRewards: undefined,
    // deregistrationInterval: undefined,
    // fees: undefined,
    minimumBond: new BigNumber("100000000000000000000000"),
    minimumEpochInterval: new BigNumber("2419200"),
    // numberOfDarknodes: undefined,
    // numberOfDarknodesLastEpoch: undefined,
    // pendingDeregistrations: undefined,
    // pendingRegistrations: undefined,
    // previousCycle: "",
    // previousEpoch: undefined,
    // timeSinceLastEpoch: undefined,
    // timeUntilNextEpoch: undefined,
};

export const getRenVMFromLightnode = (blockState: BlockState | null) => {
    if (blockState === null) {
        return null;
    }
    const renVM = {
        ...renVMFallback,
        btcBurnFee: 0,
        btcMintFee: 0,
        currentCycle: "",
        currentEpoch: undefined,
        cycleRewards: undefined,
        deregistrationInterval: undefined,
        fees: undefined,
        numberOfDarknodes: undefined,
        numberOfDarknodesLastEpoch: undefined,
        pendingDeregistrations: undefined,
        pendingRegistrations: undefined,
        previousCycle: "",
        previousEpoch: undefined,
        timeSinceLastEpoch: undefined,
        timeUntilNextEpoch: undefined,
    };

    return (renVM as never) as RenVM;
};

export const resolveRenVM = (
    fromGraph: RenVM | null,
    fromLightnode: RenVM | null,
) => {
    if (fromGraph) {
        return fromGraph;
    }
    if (fromLightnode) {
        return fromLightnode;
    }
    return renVMFallback as RenVM;
};
