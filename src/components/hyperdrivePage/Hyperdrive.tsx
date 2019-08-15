import { getTimeMagnitude, Loading, naturalTime, TokenIcon } from "@renproject/react-components";
import React, { useCallback, useState } from "react";
import { withRouter } from "react-router";
import { CSSTransitionGroup } from "react-transition-group";

import { Token } from "../../lib/ethereum/tokens";
import { Stat, Stats } from "../common/Stat";
import { TokenBalance } from "../common/TokenBalance";
import { Block, HyperdriveContainer, Tx } from "./hyperdriveContainer";

// Returning a new object reference guarantees that a before-and-after
//   equivalence check will always be false, resulting in a re-render, even
//   when multiple calls to forceUpdate are batched.

export const useForceUpdate = () => {
    const [, dispatch] = useState<{}>(Object.create(null));

    // Turn dispatch(required_parameter) into dispatch().
    return useCallback(
        (): void => {
            dispatch(Object.create(null));
        },
        [dispatch],
    );
};

let interval: NodeJS.Timeout;

export const renderTransaction = (tx: Tx): React.ReactNode => {
    // BTC
    if (tx.to === "BTC0Btc2Eth") {
        return <>Shift {tx.args[1].value / 10 ** 8} <TokenIcon token={Token.BTC} /> to <TokenIcon token={Token.ETH} /></>;
    }
    if (tx.to === "BTC0Eth2Btc") {
        return <>Shift {tx.args[2].value / 10 ** 8} <TokenIcon token={Token.BTC} /> from <TokenIcon token={Token.ETH} /></>;
    }
    // ZEC
    if (tx.to === "ZEC0Zec2Eth") {
        return <>Shift {tx.args[1].value / 10 ** 8} <TokenIcon token={Token.ZEC} /> to <TokenIcon token={Token.ETH} /></>;
    }
    if (tx.to === "ZEC0Eth2Zec") {
        return <>Shift {tx.args[2].value / 10 ** 8} <TokenIcon token={Token.ZEC} /> from <TokenIcon token={Token.ETH} /></>;
    }
    return <>
        {tx.to} {tx.args.length} {tx.out ? tx.out.length : 0}
    </>;
};

export const Hyperdrive = withRouter(({ match: { params }, history }) => {
    const container = HyperdriveContainer.useContainer();

    const blockNumber = params.blockNumber
        ? parseInt(params.blockNumber, 10)
        : null;

    const forceUpdate = useForceUpdate();

    React.useEffect(() => {
        const syncBlocks = () => {
            container.updateBlocks().catch(console.error);
        };

        if (blockNumber) {
            container.getBlock(blockNumber).catch(console.error);
        }

        // Every 30 seconds
        if (interval) {
            clearInterval(interval);
        }
        interval = setInterval(syncBlocks, 10 * 1000);
        // if (!container.blocks || container.blocks.size === 0) {
        syncBlocks();
        // }

        return () => {
            clearInterval(interval);
        };
        // tslint:disable-next-line:react-hooks/exhaustive-dep
    }, []);

    const blockTr = (block: Block) => {
        const trOnClick = () => {
            container.getBlock(block.height).catch(console.error);
            history.push(`/hyperdrive/${block.height}`);
        };
        return (
            <tr key={block.height} onClick={trOnClick}>
                <td>{block.height}</td>
                <td>
                    {naturalTime(block.timestamp, {
                        message: "Just now",
                        suffix: "ago",
                        countDown: false,
                        showingSeconds: true
                    })}
                </td>
                <td className="block--txs--td">{block.txs.length ? <div className="block--txs">{block.txs.map((tx, index) => {
                    return <div className="block--tx" key={tx.hash}>
                        {renderTransaction(tx)}
                    </div>;
                })}</div> : <span className="block--txs--none">No TXs</span>}</td>
            </tr>
        );
    };

    const firstBlock = container.blocks ? container.blocks.first<Block | null>(null) : null;

    if (firstBlock && getTimeMagnitude(firstBlock.timestamp, true)) {
        setTimeout(() => {
            forceUpdate();
        }, 1 * 1000);
    }

    return (
        <div
            className="hyperdrive container"
            key={blockNumber === null ? undefined : blockNumber}
        >
            <Stats>
                <Stat message="Number of shards" big>1</Stat>
                <Stat message="Block height" big>{firstBlock ? firstBlock.height : 0}</Stat>
                <Stat message="Locked BTC" big>
                    <TokenBalance
                        token={Token.BTC}
                        amount={String(
                            firstBlock ? firstBlock.utxosForBtc.reduce((sum, utxo) => sum + utxo.amount, 0) : 0
                        )}
                        digits={4}
                    />{" "}
                    BTC
                </Stat>
                <Stat message="Locked ZEC" big>
                    <TokenBalance
                        token={Token.ZEC}
                        amount={String(
                            firstBlock ? firstBlock.utxosForZec.reduce((sum, utxo) => sum + utxo.amount, 0) : 0
                        )}
                        digits={4}
                    />{" "}
                    ZEC
                </Stat>
            </Stats>
            {blockNumber ? (
                <Stat message={`Block ${blockNumber}`}>
                    <table>
                        <thead>
                            <tr>
                                <th>Block Number</th>
                                <th>Timestamp</th>
                                <th className="hyperdrive--table--txs">Transactions</th>
                            </tr>
                        </thead>
                        {container.currentBlock && container.currentBlockNumber === blockNumber ?
                            <CSSTransitionGroup transitionEnterTimeout={1000} transitionLeaveTimeout={1000} transitionName="fade" component="tbody">
                                {blockTr(container.currentBlock)}
                            </CSSTransitionGroup> :
                            <tbody><tr><td colSpan={3}><Loading /></td></tr></tbody>
                        }
                    </table>
                    {/* <table>
                        <thead>
                            <tr>
                                <th>Hash</th>
                                <th>To</th>
                                <th>Args</th>
                                <th>Out</th>
                            </tr>
                        </thead>
                        <tbody>
                            {container.currentBlock ? (
                                container.currentBlock.txs.map(tx => {
                                    return (
                                        <tr key={tx.hash}>
                                            <td>{tx.hash}</td>
                                            <td>{tx.to}</td>
                                            <td>{tx.args.length}</td>
                                            <td>{tx.out ? tx.out.length : 0}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                    <></>
                                )}
                        </tbody>
                    </table> */}
                    <br />
                    <br />
                </Stat>
            ) : (
                    <></>
                )}
            <Stat message="Latest blocks">
                <table>
                    <thead>
                        <tr>
                            <th>Block Number</th>
                            <th>Timestamp</th>
                            <th className="hyperdrive--table--txs">Transactions</th>
                        </tr>
                    </thead>
                    {container.blocks ?
                        <CSSTransitionGroup transitionEnterTimeout={1000} transitionLeaveTimeout={1000} transitionName="fade" component="tbody">
                            {container.blocks.map(blockTr)}
                        </CSSTransitionGroup> :
                        <tbody><tr><td colSpan={3}><Loading /></td></tr></tbody>
                    }
                </table>
            </Stat>
        </div>
    );
});
