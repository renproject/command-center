import { RenNetworkDetails } from "@renproject/contracts";
import { Record } from "@renproject/react-components";
import Axios from "axios";

import {
    retryNTimes,
    RPCResponse,
} from "../../controllers/pages/renvmStatsPage/renvmContainer";

import { getLightnode } from "../../store/mapContainer";
import { DEFAULT_REQUEST_TIMEOUT } from "../react/environmentVariables";
import { queryBlockStateResponseMock } from "./utils/currentMock";
import { QueryBlockStateResponse } from "./utils/feesUtils";

interface ResponseQueryStat {
    version: string;
    multiAddress: string;
    cpus: Array<{
        cores: number;
        clockRate: number;
        cacheSize: number;
        modelName: string;
    }>;
    memory: number;
    memoryUsed: number;
    memoryFree: number;
    disk: number;
    diskUsed: number;
    diskFree: number;
    systemUptime: number;
    serviceUptime: number;
}

export class NodeStatistics extends Record({
    version: "",
    multiAddress: "",
    memory: 0,
    memoryUsed: 0,
    memoryFree: 0,
    disk: 0,
    diskUsed: 0,
    diskFree: 0,
    systemUptime: 0,
    serviceUptime: 0,

    cores: 0,
}) {}

export const queryStat = async (lightnode: string, darknodeID: string) => {
    const request = {
        jsonrpc: "2.0",
        method: "ren_queryStat",
        params: {},
        id: 67,
    };
    const result = (
        await retryNTimes(
            async () =>
                await Axios.post<RPCResponse<ResponseQueryStat>>(
                    `${lightnode}?id=${darknodeID}`,
                    request,
                    { timeout: DEFAULT_REQUEST_TIMEOUT },
                ),
            2,
        )
    ).data.result;
    return new NodeStatistics({
        version: result.version,
        multiAddress: result.multiAddress,
        memory: result.memory,
        memoryUsed: result.memoryUsed,
        memoryFree: result.memoryFree,
        disk: result.disk,
        diskUsed: result.diskUsed,
        diskFree: result.diskFree,
        systemUptime: result.systemUptime,
        serviceUptime: result.serviceUptime,
        cores: result.cpus.reduce((sum, cpu) => sum + cpu.cores, 0),
    });
};

interface ResponseQueryBlockState {
    jsonrpc: "2.0";
    id: number;
    result: QueryBlockStateResponse;
}

export const queryBlockState = async (
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
        return Promise.resolve(queryBlockStateResponseMock);
    }

    return Axios.post<ResponseQueryBlockState>(lightnode, request, {
        timeout: DEFAULT_REQUEST_TIMEOUT,
    });
};
