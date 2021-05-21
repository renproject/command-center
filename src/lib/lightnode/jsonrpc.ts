import { RenNetworkDetails } from "@renproject/contracts";
import { Record } from "@renproject/react-components";
import Axios from "axios";
import { List } from "immutable";

import {
    Block,
    RPCResponse,
} from "../../controllers/pages/renvmStatsPage/renvmContainer";
import { getLightnode } from "../../store/mapContainer";
import { DEFAULT_REQUEST_TIMEOUT } from "../react/environmentVariables";
import { queryBlockStateResponse } from "./fees/fees.bs.mock";

interface QueryBlockStateResponse {
    jsonrpc: "2.0";
    id: number;
    result: typeof queryBlockStateResponse;
}

export const getQueryBlockState = async (
    network: RenNetworkDetails,
): Promise<any> => {
    const lightnode = getLightnode(network);
    if (!lightnode) {
        throw new Error(`No lightnode to fetch fees.`);
    }
    const request = {
        jsonrpc: "2.0",
        method: "ren_queryBlockState",
        id: 300,
    };

    if (lightnode !== "foo") {
        // TODO: fees use mock until done
        return Promise.resolve(queryBlockStateResponse);
    }

    return Axios.post<QueryBlockStateResponse>(lightnode, request, {
        timeout: DEFAULT_REQUEST_TIMEOUT,
    });
};
