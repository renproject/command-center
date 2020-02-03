// tslint:disable: no-unused-variable

import { RenNetworkDetails, testnet } from "@renproject/contracts";
import { sleep } from "@renproject/react-components";
import Axios from "axios";
import { List } from "immutable";
import { useState } from "react";
import { createContainer } from "unstated-next";

import { extractError } from "../../lib/react/errors";
import { getLightnode } from "../overviewPage/mapContainer";

type Addr = string;
type B = string;
type B32 = string;
type U32 = number;
type U64 = number;
// tslint:disable-next-line: no-any
type Value = any;

export enum Type {
    Addr = "addr",
    Str = "str",
    B20 = "b20",
    B32 = "b32",
    B = "b",
    I8 = "i8",
    I16 = "i16",
    I32 = "i32",
    I64 = "i64",
    U8 = "u8",
    U16 = "u16",
    U32 = "u32",
    U64 = "u64",
    BTCCompatUTXOs = "ext_btcCompatUTXOs",
}

interface Arg {
    name: string;
    type: Type;
    value: Value;
}

type Args = Arg[];

export interface Tx {
    hash: B32;
    to: Addr;
    args: Args;
    out: Args;
}

type Txs = Tx[];

interface ExtBtcCompatUTXO {
    txHash: B32;
    vOut: U32;
    scriptPubKey: B;
    amount: U64;
    ghash: B32;
}

type ExtBtcCompatUTXOs = ExtBtcCompatUTXO[];

export interface Block {
    hash: B32;
    header: {
        kind: 1;
        parentHash: B32;
        baseHash: B32;
        height: U64;
        round: U64;
        timestamp: U64;
        signatories: null;
    };
    data: Txs;
    prevState: [
        {
            name: "bchUTXOs";
            type: "ext_btcCompatUTXOs";
            value: ExtBtcCompatUTXOs;
        },
        {
            name: "btcUTXOs";
            type: "ext_btcCompatUTXOs";
            value: ExtBtcCompatUTXOs;
        },
        {
            name: "zecUTXOs";
            type: "ext_btcCompatUTXOs";
            value: ExtBtcCompatUTXOs;
        }
    ];
}

type Blocks = Block[];

export interface RPCResponse<T> {
    jsonrpc: "2.0";
    id: number;
    result: T;
}

interface ResponseQueryBlock {
    block: Block;
}

interface ResponseQueryBlocks {
    blocks: Blocks | null;
}

const N = 8;

export const retryNTimes = async <T>(fnCall: () => Promise<T>, retries: number) => {
    let returnError;
    // tslint:disable-next-line: no-constant-condition
    for (let i = 0; i < retries; i++) {
        // if (i > 0) {
        //     console.debug(`Retrying...`);
        // }
        try {
            return await fnCall();
        } catch (error) {
            if (String(error).match(/timeout of .* exceeded/)) {
                returnError = error;
            } else {
                const errorMessage = extractError(error);
                if (errorMessage) {
                    error.message += ` (${errorMessage})`;
                }
                throw error;
            }
        }
        await sleep(100);
    }
    throw returnError;
};

const getBlocks = async (network: RenNetworkDetails, previousBlocks: List<Block>): Promise<List<Block>> => {
    const lightnode = getLightnode(network);
    if (!lightnode) {
        throw new Error(`No lightnode to fetch darknode locations.`);
    }
    const firstBlock = previousBlocks.first<Block | null>(null);
    let previousHeight = null;
    if (firstBlock) {
        previousHeight = firstBlock.header.height;
    }
    if (previousHeight === null) {
        const request = { jsonrpc: "2.0", method: "ren_queryBlocks", params: { n: N }, id: 67 };
        let response;
        let i = 0;
        do {
            response = (await retryNTimes(async () => await Axios.post<RPCResponse<ResponseQueryBlocks>>(lightnode, request), 5)).data.result;
            i++;
        } while ((response.blocks === null || response.blocks.length === 0) && i < 5);
        return response.blocks ? List(response.blocks).sort((a, b) => b.header.height - a.header.height) : List();
    } else {
        let currentHeight = null as number | null;
        let syncedHeight = null as number | null;
        let newBlocks = List<Block>();
        while (
            currentHeight === null || syncedHeight === null ||
            (syncedHeight > previousHeight + 1 && syncedHeight + N - 1 > currentHeight && syncedHeight > 0)
        ) {
            const request = { jsonrpc: "2.0", method: "ren_queryBlock", params: { blockHeight: syncedHeight && syncedHeight - 1 }, id: 67 };
            const response = (await retryNTimes(() => Axios.post<RPCResponse<ResponseQueryBlock>>(lightnode, request), 4)).data.result;
            const latestBlock = response.block;
            if (latestBlock.header.height === previousHeight) {
                break;
            }
            currentHeight = currentHeight || latestBlock.header.height;
            syncedHeight = latestBlock.header.height;
            newBlocks = newBlocks.push(latestBlock);
        }
        return newBlocks.concat(previousBlocks).slice(0, N).toList();
    }
};

const useRenVMContainer = (initialState = testnet as RenNetworkDetails) => {
    // tslint:disable-next-line: whitespace
    const [network,] = useState(initialState);
    // tslint:disable-next-line: prefer-const
    let [blocks, setBlocks] = useState<List<Block> | null>(null);
    // tslint:disable-next-line: prefer-const
    let [currentBlock, setCurrentBlock] = useState<null | Block>(null);
    // tslint:disable-next-line: prefer-const
    let [currentBlockNumber, setCurrentBlockNumber] = useState<null | number>(null);

    const updateBlocks = async () => {
        blocks = await getBlocks(network, blocks || List<Block>());
        setBlocks(blocks);
    };

    const getBlock = async (blockNumber: number) => {
        const lightnode = getLightnode(network);
        if (!lightnode) {
            return;
        }
        let newCurrentBlock;

        if (blocks) {
            const first = blocks.first<Block | null>(null);
            const last = blocks.last<Block | null>(null);

            // Check if we already have the block in the list of recent blocks.
            if (first && last && first.header.height >= blockNumber && last.header.height <= blockNumber) {
                for (const block of blocks.toArray()) {
                    if (block.header.height === blockNumber) {
                        newCurrentBlock = block;
                        break;
                    }
                }
            }
        }

        // Fetch the block from the lightnode.
        if (!newCurrentBlock) {
            const request = { jsonrpc: "2.0", method: "ren_queryBlock", params: { n: 5, blockHeight: blockNumber }, id: 67 };
            const response = (await retryNTimes(async () => await Axios.post<RPCResponse<ResponseQueryBlock>>(lightnode, request), 5)).data.result;
            newCurrentBlock = response.block;
        }

        currentBlock = newCurrentBlock;
        setCurrentBlock(currentBlock);
        currentBlockNumber = currentBlock.header.height;
        setCurrentBlockNumber(currentBlockNumber);
    };

    return { blocks, updateBlocks, getBlock, currentBlock, currentBlockNumber };
};

export const RenVMContainer = createContainer(useRenVMContainer);
