// tslint:disable: no-unused-variable

import { RenNetworkDetails, testnet } from "@renproject/contracts";
import { sleep } from "@renproject/react-components";
import RenJS from "@renproject/ren";
import { RenVMArg, RenVMType } from "@renproject/ren-js-common/build/main";
import { ResponseQueryTx } from "@renproject/ren/build/main/renVM/jsonRPC";
import Axios from "axios";
import { List, OrderedMap } from "immutable";
import { useState } from "react";
import { createContainer } from "unstated-next";

import { EncodedData, Encodings } from "../../lib/general/encodedData";
import { extractError } from "../../lib/react/errors";
import { getLightnode } from "../networkDarknodesPage/mapContainer";

export type Tx = ResponseQueryTx["tx"];

type Txs = Tx[];

export interface Block {
    hash: RenVMType.TypeB32;
    header: {
        kind: 1;
        parentHash: RenVMType.TypeB32;
        baseHash: RenVMType.TypeB32;
        height: number;
        round: number;
        timestamp: number;
        signatories: null;
    };
    data: Txs;
    prevState: [
        RenVMArg<"bchUTXOs", RenVMType.ExtTypeBtcCompatUTXOs>,
        RenVMArg<"btcUTXOs", RenVMType.ExtTypeBtcCompatUTXOs>,
        RenVMArg<"zecUTXOs", RenVMType.ExtTypeBtcCompatUTXOs>,
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
    // if (previousHeight === null) {
    const request = { jsonrpc: "2.0", method: "ren_queryBlocks", params: { n: N }, id: 67 };
    let response;
    let i = 0;
    do {
        response = (await retryNTimes(async () => await Axios.post<RPCResponse<ResponseQueryBlocks>>(lightnode, request), 5)).data.result;
        i++;
    } while ((response.blocks === null || response.blocks.length === 0) && i < 5);
    return response.blocks ? List(response.blocks).sort((a, b) => b.header.height - a.header.height) : List();
    // } else {
    //     let currentHeight = null as number | null;
    //     let syncedHeight = null as number | null;
    //     let newBlocks = List<Block>();
    //     while (
    //         currentHeight === null || syncedHeight === null ||
    //         (syncedHeight > previousHeight + 1 && syncedHeight + N - 1 > currentHeight && syncedHeight > 0)
    //     ) {
    //         const request = { jsonrpc: "2.0", method: "ren_queryBlock", params: { blockHeight: syncedHeight && syncedHeight - 1 }, id: 67 };
    //         const response = (await retryNTimes(() => Axios.post<RPCResponse<ResponseQueryBlock>>(lightnode, request), 4)).data.result;
    //         const latestBlock = response.block;
    //         if (latestBlock.header.height === previousHeight) {
    //             break;
    //         }
    //         currentHeight = currentHeight || latestBlock.header.height;
    //         syncedHeight = latestBlock.header.height;
    //         newBlocks = newBlocks.push(latestBlock);
    //     }
    //     return newBlocks.concat(previousBlocks).slice(0, N).toList();
    // }
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
    // tslint:disable-next-line: prefer-const
    let [currentTransaction, setCurrentTransaction] = useState<undefined | null | ResponseQueryTx>(undefined);
    // tslint:disable-next-line: prefer-const
    let [currentTransactionHash, setCurrentTransactionHash] = useState<undefined | null | string>(undefined);
    // tslint:disable-next-line: prefer-const
    let [transactions, setTransactions] = useState<OrderedMap<string, ResponseQueryTx | null>>(OrderedMap());

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

    const getTransaction = async (txHashHex: string, options?: { skipCache?: boolean }) => {
        if (options && !options.skipCache && transactions && transactions.get(txHashHex)) {
            currentTransaction = transactions.get(txHashHex);
        } else {

            try {
                currentTransaction = await new RenJS(network.name).lightnode.queryTx(new EncodedData(txHashHex, Encodings.HEX).toBase64());
            } catch (error) {
                console.error(error);
                currentTransaction = null;
            }

            const count = transactions.count();
            transactions = transactions
                .slice(count - 5, count)
                .set(txHashHex, currentTransaction);
            setTransactions(transactions);
        }

        setCurrentTransactionHash(txHashHex);
        setCurrentTransaction(currentTransaction);

        return currentTransaction;
    };

    return { network, blocks, updateBlocks, getBlock, currentBlock, currentBlockNumber, getTransaction, currentTransaction, currentTransactionHash };
};

export const RenVMContainer = createContainer(useRenVMContainer);
