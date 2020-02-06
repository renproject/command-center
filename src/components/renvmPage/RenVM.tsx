import { getTimeMagnitude, Loading, naturalTime, TokenIcon } from "@renproject/react-components";
import React, { useCallback, useState } from "react";
import { withRouter } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import BigNumber from "bignumber.js";

import { Token } from "../../lib/ethereum/tokens";
import { Stat, Stats } from "../common/Stat";
import { TokenBalance } from "../common/TokenBalance";
import { Block, RenVMContainer, Tx, Type } from "./renvmContainer";

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
    const [match, _chain, _left, _right] = tx.to.match(/([A-Z0-9]*)0([A-Za-z0-0]*)2([A-Za-z0-0]*)/) || [];

    if (match) {
        const [chain, left, right] = [_chain.toUpperCase() as Token, _left.toUpperCase() as Token, _right.toUpperCase() as Token];

        if (chain === left) {
            return <>Shift {tx.args[1].value / 10 ** 8} <TokenIcon white={true} token={left} /> to <TokenIcon white={true} token={right} /></>;
        } else if (chain === right) {
            return <>Shift {tx.args[2].value / 10 ** 8} <TokenIcon white={true} token={right} /> from <TokenIcon white={true} token={left} /></>;
        }
        return <>Shift {tx.args[1].value / 10 ** 8} <TokenIcon white={true} token={left} /> to <TokenIcon white={true} token={right} /> on <TokenIcon white={true} token={chain} /></>;
    }
    return <>
        {tx.to} {tx.args.length} {tx.out ? tx.out.length : 0}
    </>;
};

export const RenVM = withRouter(({ match: { params }, history }) => {
    const container = RenVMContainer.useContainer();

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
        interval = setInterval(syncBlocks, 7.5 * 1000); // Half the cache time
        // if (!container.blocks || container.blocks.size === 0) {
        syncBlocks();
        // }

        return () => {
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onClick = useCallback((block: Block) => {
        container.getBlock(block.header.height).catch(console.error);
        history.push(`/renvm/${block.header.height}`);
    }, [container, history]);

    const onClose = useCallback(() => {
        history.push(`/renvm/`);
    }, [container, history]);

    const blockTr = (block: Block) => {
        const trOnClick = () => onClick(block);
        return <CSSTransition
            key={block.header.height}
            classNames="fade"
            timeout={{ enter: 1000, exit: 1000 }}
        >
            <tr key={block.header.height} onClick={trOnClick} className="block--row">
                <td>{block.header.height}</td>
                <td>
                    {naturalTime(block.header.timestamp, {
                        message: "Just now",
                        suffix: "ago",
                        countDown: false,
                        showingSeconds: true
                    })}
                </td>
                <td className="block--txs--td">{block.data && block.data.length && block.data.map ? <div className="block--txs">{block.data.map((tx, index) => {
                    return <div className="block--tx" key={tx.hash}>
                        {renderTransaction(tx)}
                    </div>;
                })}</div> : <span className="block--txs--none">No TXs</span>}</td>
            </tr>
        </CSSTransition>;
    };

    const firstBlock = container.blocks ? container.blocks.first<Block | null>(null) : null;

    if (firstBlock && getTimeMagnitude(firstBlock.header.timestamp, true)) {
        setTimeout(() => {
            forceUpdate();
        }, 1 * 1000);
    }

    // For each locked token, create a <Stat> element
    // tslint:disable-next-line: no-any
    const lockedBalances: any = {};
    if (firstBlock && firstBlock.prevState && firstBlock.prevState.map) {
        firstBlock.prevState.map((state) => {
            if (state.type === Type.BTCCompatUTXOs && state.name.match(/.*UTXOs/)) {
                const token = state.name.replace("UTXOs", "").toUpperCase();
                lockedBalances[token] = <Stat message={`Locked ${token}`} big>
                    <TokenBalance
                        token={token as Token}
                        amount={state && state.value ? state.value.reduce((sum, utxo) => sum.plus(utxo.amount), new BigNumber(0)).toFixed() : 0}
                        digits={4}
                    />{" "}
                    {token}
                </Stat>;
            }
        });
    }

    // Override the order of the tokens (returned back in alphabetical order)
    const { [Token.BTC]: lockedBTC, [Token.ZEC]: lockedZEC, ...remainingLockedBalances } = lockedBalances;

    return (
        <div
            className="renvm container"
            key={blockNumber === null ? undefined : blockNumber}
        >
            <Stats>
                <Stat message="Number of shards" big>1</Stat>
                <Stat message="Block height" big>{firstBlock ? firstBlock.header.height : 0}</Stat>
                {lockedBTC}
                {lockedZEC}
                {remainingLockedBalances ? Object.values(remainingLockedBalances) : <></>}
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
                                <th className="renvm--table--txs">Transactions</th>
                            </tr>
                        </thead>
                        {container.currentBlock && container.currentBlockNumber === blockNumber ?
                            <TransitionGroup component="tbody">
                                {blockTr(container.currentBlock)}
                            </TransitionGroup> :
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
                                container.currentBlock.data && container.currentBlock.data.length > 0 && container.currentBlock.data.map ?
                                    container.currentBlock.data.map(tx => {
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
                            <th className="renvm--table--txs">Transactions</th>
                        </tr>
                    </thead>
                    {container.blocks ?
                        <TransitionGroup component="tbody">
                            {container.blocks.map(blockTr).toArray()}
                        </TransitionGroup> :
                        <tbody><tr><td colSpan={3}><Loading alt={true} /></td></tr></tbody>
                    }
                </table>
            </Stat>
        </div>
    );
});
