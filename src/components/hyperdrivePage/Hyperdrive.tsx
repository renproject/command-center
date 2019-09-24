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
        return <>Shift {tx.args[1].value / 10 ** 8} <TokenIcon white={true} token={Token.BTC} /> to <TokenIcon white={true} token={Token.ETH} /></>;
    }
    if (tx.to === "BTC0Eth2Btc") {
        return <>Shift {tx.args[2].value / 10 ** 8} <TokenIcon white={true} token={Token.BTC} /> from <TokenIcon white={true} token={Token.ETH} /></>;
    }
    // ZEC
    if (tx.to === "ZEC0Zec2Eth") {
        return <>Shift {tx.args[1].value / 10 ** 8} <TokenIcon white={true} token={Token.ZEC} /> to <TokenIcon white={true} token={Token.ETH} /></>;
    }
    if (tx.to === "ZEC0Eth2Zec") {
        return <>Shift {tx.args[2].value / 10 ** 8} <TokenIcon white={true} token={Token.ZEC} /> from <TokenIcon white={true} token={Token.ETH} /></>;
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onClick = useCallback((block: Block) => {
        container.getBlock(block.height).catch(console.error);
        history.push(`/hyperdrive/${block.height}`);
    }, [container, history]);

    const onClose = useCallback(() => {
        history.push(`/hyperdrive/`);
    }, [container, history]);

    const blockTr = (block: Block) => {
        const trOnClick = () => { onClick(block); };
        return (
            <tr key={block.height} onClick={trOnClick} className="block--row">
                <td>{block.height}</td>
                <td>
                    {naturalTime(block.timestamp, {
                        message: "Just now",
                        suffix: "ago",
                        countDown: false,
                        showingSeconds: true
                    })}
                </td>
                <td className="block--txs--td">{block.txs && block.txs.length ? <div className="block--txs">{block.txs.map((tx, index) => {
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
                            firstBlock && firstBlock.utxosForBtc ? firstBlock.utxosForBtc.reduce((sum, utxo) => sum + utxo.amount, 0) : 0
                        )}
                        digits={4}
                    />{" "}
                    BTC
                </Stat>
                <Stat message="Locked ZEC" big>
                    <TokenBalance
                        token={Token.ZEC}
                        amount={String(
                            firstBlock && firstBlock.utxosForZec ? firstBlock.utxosForZec.reduce((sum, utxo) => sum + utxo.amount, 0) : 0
                        )}
                        digits={4}
                    />{" "}
                    ZEC
                </Stat>
            </Stats>
            {blockNumber ? <>
                <div className="selected-block">
                    <div role="button" className="popup--x popup--x--white" onClick={onClose} />
                    <h3>Block {blockNumber}</h3>
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
                            <tbody><tr><td colSpan={3}><Loading alt={true} /></td></tr></tbody>
                        }
                    </table>
                    <h4>Transactions</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>TX</th>
                                <th>Hash</th>
                                <th>Contract</th>
                                <th>Args</th>
                                <th>Outputs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {container.currentBlock && container.currentBlockNumber === blockNumber ?
                                container.currentBlock.txs && container.currentBlock.txs.length > 0 ?
                                    container.currentBlock.txs.map(tx => {
                                        return (
                                            <tr key={tx.hash}>
                                                <td className="block--tx" key={tx.hash}>
                                                    {renderTransaction(tx)}
                                                </td>
                                                <td className="monospace">{tx.hash}</td>
                                                <td className="monospace">{tx.to}</td>
                                                <td>{tx.args.length}</td>
                                                <td>{tx.out ? tx.out.length : 0}</td>
                                            </tr>
                                        );
                                    }) :
                                    <>
                                        <tr><td colSpan={5}>No transactions</td></tr>
                                    </> :
                                <tr><td colSpan={5}><Loading alt={true} /></td></tr>
                            }
                        </tbody>
                    </table>
                </div>
            </> : (
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
                        <tbody><tr><td colSpan={3}><Loading alt={true} /></td></tr></tbody>
                    }
                </table>
            </Stat>
        </div>
    );
});
