import React, { useState } from "react";
import { CSSTransitionGroup } from "react-transition-group";
import { withRouter } from "react-router";
import { Loading } from "@renproject/react-components";
import { Link } from "react-router-dom";

import { Token } from "../../lib/ethereum/tokens";
import { naturalTime } from "../../lib/general/conversion";
import { TokenBalance } from "../common/TokenBalance";
import { Block, HyperdriveContainer } from "./hyperdriveContainer";

let interval: NodeJS.Timeout;

export const Hyperdrive = withRouter(({ match: { params } }) => {
    const container = HyperdriveContainer.useContainer();

    const blockNumber = params.blockNumber ? parseInt(params.blockNumber, 10) : null;

    // tslint:disable-next-line: prefer-const
    let [initialized, setInitialized] = useState(false);
    React.useEffect(() => {
        console.log(`initialized: ${initialized}`);
        if (initialized) {
            return;
        }
        const syncBlocks = () => {
            console.log(`Syncing!`);
            container.updateBlocks().catch(console.error);
        };

        if (blockNumber) {
            container.getBlock(blockNumber).catch(console.error);
        }

        // Every 30 seconds
        if (interval) { clearInterval(interval); }
        interval = setInterval(syncBlocks, 10 * 1000);
        if (container.blocks.size === 0) {
            syncBlocks();
        }

        initialized = true;
        setInitialized(initialized);

        // return () => {
        //     console.log(`No more syncing!`);
        //     clearInterval(interval);
        // };
        // tslint:disable-next-line:react-hooks/exhaustive-dep
    }, [initialized, blockNumber]);

    const blockTr = (block: Block) => {
        return <tr key={block.height}>
            <td><a href={`/hyperdrive/${block.height}`}>{block.height}</a></td>
            <td>
                {naturalTime(block.timestamp, {
                    message: "Just now",
                    suffix: "ago",
                    countDown: false,
                    showingSeconds: true,
                })}
            </td>
            <td>
                {block.txs.length} TXs
                            </td>
            <td>
                <TokenBalance
                    token={Token.BTC}
                    amount={String(block.utxosForBtc.reduce((sum, utxo) => sum + utxo.amount, 0))}
                    digits={4}
                /> BTC
                            </td>
            <td>
                <TokenBalance
                    token={Token.ZEC}
                    amount={String(block.utxosForZec.reduce((sum, utxo) => sum + utxo.amount, 0))}
                    digits={4}
                /> ZEC
            </td>
        </tr>;
    };

    return (
        <div className="map container" key={blockNumber === null ? undefined : blockNumber}>
            {blockNumber ? <>
                <hr />
                <h2>Block {blockNumber}</h2>
                <table className="fees-block--table">
                    <thead>
                        <th>Block Number</th>
                        <th>Timestamp</th>
                        <th>Number of Transactions</th>
                        <th>BTC locked</th>
                        <th>ZEC locked</th>
                    </thead>
                    <tbody>
                        {container.currentBlock ? blockTr(container.currentBlock) : <Loading />}
                    </tbody>
                </table>
                <table className="fees-block--table">
                    <thead>
                        <th>Hash</th>
                        <th>To</th>
                        <th>Args</th>
                        <th>Out</th>
                    </thead>
                    <tbody>
                        {container.currentBlock ? container.currentBlock.txs.map((tx) => {
                            return <tr key={tx.hash}>
                                <td>{tx.hash}</td>
                                <td>{tx.to}</td>
                                <td>{tx.args.length}</td>
                                <td>{tx.out ? tx.out.length : 0}</td>
                            </tr>;
                        }) : <></>}
                    </tbody>
                </table>
                <br />
                <br />
            </> : <></>
            }
            <hr />
            <h2>Latest Blocks</h2>
            <table className="fees-block--table">
                <thead>
                    <th>Block Number</th>
                    <th>Timestamp</th>
                    <th>Number of Transactions</th>
                    <th>BTC locked</th>
                    <th>ZEC locked</th>
                </thead>
                <CSSTransitionGroup
                    transitionName="fade"
                    component="tbody"
                >
                    {container.blocks.map(blockTr)}
                </CSSTransitionGroup>
            </table>
        </div>
    );
});