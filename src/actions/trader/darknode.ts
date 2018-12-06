import RenExSDK from "@renex/renex";

import { Dispatch } from "redux";

export type DeregisterDarknodeAction = (sdk: RenExSDK, darknodeID: string) => (dispatch: Dispatch) => Promise<void>;
export const deregisterDarknode: DeregisterDarknodeAction = (sdk, darknodeID) => async (dispatch) => {
    await sdk._contracts.darknodeRegistry.deregister(darknodeID, { from: sdk.getAddress(), gas: 200000 });
};
