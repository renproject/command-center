import { RenNetworkDetails } from "@renproject/contracts";
import { Record } from "@renproject/react-components";
import Axios from "axios";

import {
    retryNTimes,
    RPCResponse,
} from "../../controllers/pages/renvmStatsPage/renvmContainer";

import { getLightnode } from "../../store/mapContainer";
import { DEFAULT_REQUEST_TIMEOUT } from "../react/environmentVariables";
import {
    QueryBlockStateResponse,
    toNativeTokenSymbol,
} from "./utils/blockStateUtils";
// import { queryBlockStateResponse } from "./utils/mocks/fees.bs.testnet.mock";

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

export interface RenVMState {
    state: {
        [chain: string]: {
            address: string; // "19iqYbeATe4RxghQZJnYVFU4mjUUu76EA6";
            dust: string; // "546";
            gasCap: string; // "68";
            gasLimit: string; // "400";
            gasPrice: string; // "68";
            latestChainHash: string; // "";
            latestChainHeight: string; // "687159";
            minimumAmount: string; // "547";
            output?: {
                outpoint: {
                    hash: string; // "X8rTxRtVMBPJeOp3n5O7lvtzwL5CpP2wOBXfvw2JrpQ";
                    index: string; // "1";
                };
                pubKeyScript: string; // "dqkUX6qVduRay8lmK2q_MjIpt0ipSV2IrA";
                value: string; // "1103287860496";
            };
            pubKey: string; // "A6Auk8-MR7JQB1sK9h-W69EDdsCqp2NRSOiJyytRyWkn";
        };
    };
}

export const queryState = async (lightnode: string): Promise<RenVMState> => {
    const request = {
        jsonrpc: "2.0",
        method: "ren_queryState",
        params: {},
        id: 67,
    };
    const result = (
        await retryNTimes(
            async () =>
                await Axios.post<RPCResponse<RenVMState>>(lightnode, request, {
                    timeout: DEFAULT_REQUEST_TIMEOUT,
                }),
            2,
        )
    ).data.result;
    return result;
};

export const queryBlockState = async (network: RenNetworkDetails) => {
    const lightnode = getLightnode(network, true);
    if (!lightnode) {
        throw new Error(`No lightnode to fetch fees.`);
    }
    const request = {
        jsonrpc: "2.0",
        method: "ren_queryBlockState",
        id: 300,
        params: {},
    };

    // if (lightnode !== "toggleMock") {
    //     return Promise.resolve(queryBlockStateResponse);
    // }

    const response = await Axios.post<RPCResponse<QueryBlockStateResponse>>(
        lightnode,
        request,
        {
            timeout: DEFAULT_REQUEST_TIMEOUT,
        },
    );
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    return response.data as any;
};

export type ClaimFeesParams = {
    darknodeId: string;
    amount: string;
    epoch: string;
    to: string;
    signature: string;
};

export const claimFees = async (
    network: RenNetworkDetails,
    token: string,
    node: string,
    amount: string,
    to: string,
) => {
    const lightnode = getLightnode(network, true);
    if (!lightnode) {
        throw new Error(`No lightnode to claim fees.`);
    }
    const request = {
        method: "ren_submitTx",
        id: 1,
        jsonrpc: "2.0",
        params: {
            tx: {
                hash: "eKT2CEAd3ZuzIsQ5mrqKO9Yv24e7ql9fSi-ltOUXfBM",
                in: {
                    t: {
                        struct: [
                            {
                                txid: "bytes",
                            },
                            {
                                txindex: "u32",
                            },
                            {
                                amount: "u256",
                            },
                            {
                                payload: "bytes",
                            },
                            {
                                phash: "bytes32",
                            },
                            {
                                to: "string",
                            },
                            {
                                nonce: "bytes32",
                            },
                            {
                                nhash: "bytes32",
                            },
                            {
                                gpubkey: "bytes",
                            },
                            {
                                ghash: "bytes32",
                            },
                        ],
                    },
                    v: {
                        amount: "401480",
                        ghash: "9VxewtRVSJmKnc2jhplArqWeSOxE50msbMJd1hx2X7U",
                        gpubkey: "A4knRXgAkxx9RNyUywAhtOiB-ZNcEjTckvRW4y7AGdXX",
                        nhash: "MUdOHf1As-OXFjQMI0PogV6Lx5PKbSPN7fpvZu21okM",
                        nonce: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACs",
                        payload: "",
                        phash: "xdJGAYb3IzySfn2y3McDwOUAtlPKgic7e_rYBF2FpHA",
                        to: "bc1qj4cj3406k5pe4m0m7ngth35w73aghljghpykqf",
                        txid: "aCjatCwWSIALMAzSsTGPgSadDgZT8Nsc2iAqn413ewY",
                        txindex: "0",
                    },
                },
                selector: `${toNativeTokenSymbol(token)}/claimFees`,
                version: "1",
            },
        },
    };
    console.info(request);
};
