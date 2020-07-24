import { Record } from "@renproject/react-components";
import Axios from "axios";

import {
    retryNTimes, RPCResponse,
} from "../../components/statsPages/renvmStatsPage/renvmContainer";
import { DEFAULT_REQUEST_TIMEOUT } from "../react/environmentVariables";

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
}) { }

export const queryStat = async (lightnode: string, darknodeID: string) => {
    const request = { jsonrpc: "2.0", method: "ren_queryStat", params: {}, id: 67 };
    const result = (await retryNTimes(async () => await Axios.post<RPCResponse<ResponseQueryStat>>(`${lightnode}?id=${darknodeID}`, request, { timeout: DEFAULT_REQUEST_TIMEOUT }), 2)).data.result;
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
