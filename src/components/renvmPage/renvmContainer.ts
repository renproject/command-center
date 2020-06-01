import { RenNetworkDetails } from "@renproject/contracts";
import { RenVMArg, RenVMType } from "@renproject/interfaces";
import { sleep } from "@renproject/react-components";
import RenJS from "@renproject/ren";
import { ResponseQueryTx } from "@renproject/rpc";
import Axios from "axios";
import { List, OrderedMap } from "immutable";
import { useState } from "react";
import { createContainer } from "unstated-next";

import { EncodedData, Encodings } from "../../lib/general/encodedData";
import { extractError } from "../../lib/react/errors";
import { Web3Container } from "../../store/web3Store";
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
        RenVMArg<"bch", RenVMType.ExtTypeBtcCompatUTXOs>,
        RenVMArg<"btc", RenVMType.ExtTypeBtcCompatUTXOs>,
        RenVMArg<"zec", RenVMType.ExtTypeBtcCompatUTXOs>,
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

const getBlocks = async (network: RenNetworkDetails): Promise<List<Block>> => {
    const lightnode = getLightnode(network);
    if (!lightnode) {
        throw new Error(`No lightnode to fetch darknode locations.`);
    }
    const request = { jsonrpc: "2.0", method: "ren_queryBlocks", params: { n: N }, id: 67 };
    let response;
    let i = 0;
    do {
        response = (await retryNTimes(async () => await Axios.post<RPCResponse<ResponseQueryBlocks>>(lightnode, request), 2)).data.result;
        i++;
    } while ((response.blocks === null || response.blocks.length === 0) && i < 5);
    return response.blocks ? List(response.blocks).sort((a, b) => b.header.height - a.header.height) : List();
};

const useRenVMContainer = () => {
    const { renNetwork: network } = Web3Container.useContainer();

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
        if (network) {
            blocks = await getBlocks(network);
            setBlocks(blocks);
        }
    };

    const getBlock = async (blockNumber: number) => {
        if (!network) {
            return;
        }
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
            const response = (await retryNTimes(async () => await Axios.post<RPCResponse<ResponseQueryBlock>>(lightnode, request), 2)).data.result;
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

            if (network) {
                try {
                    currentTransaction = await new RenJS(network.name).renVM.queryTx(new EncodedData(txHashHex, Encodings.HEX).toBase64());
                } catch (error) {
                    console.error(error);
                    currentTransaction = null;
                }
            } else {
                currentTransaction = null;
            }

            const count = transactions.count();
            transactions = transactions
                .slice(count - 5, count)
                .set(txHashHex, currentTransaction || null);
            setTransactions(transactions);
        }

        setCurrentTransactionHash(txHashHex);
        setCurrentTransaction(currentTransaction);

        return currentTransaction;
    };

    return { network, blocks, updateBlocks, getBlock, currentBlock, currentBlockNumber, getTransaction, currentTransaction, currentTransactionHash };
};

export const RenVMContainer = createContainer(useRenVMContainer);
