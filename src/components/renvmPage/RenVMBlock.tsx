import { Loading, naturalTime } from "@renproject/react-components";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import { Block } from "./renvmContainer";
import { TransactionPreview } from "./RenVMTransaction";

interface Props extends RouteComponentProps {
    blockNumber: number;
    block: Block | null | undefined;
    onClose: () => void;
    onTxClick: (txHashHex: string) => void;
    onBlockClick: (bockNumber: number) => void;
}

export const RenVMBlock = withRouter(({ history, blockNumber, onClose, onTxClick, onBlockClick, block }: Props) => {
    const blockTr = (blockRow: Block) => {
        const trOnClick = () => onBlockClick(blockRow.header.height);
        return <CSSTransition
            key={blockRow.header.height}
            classNames="fade"
            timeout={{ enter: 1000, exit: 1000 }}
        >
            <tr key={blockRow.header.height} onClick={trOnClick} className="block--row">
                <td>{blockRow.header.height}</td>
                <td>
                    {naturalTime(blockRow.header.timestamp, {
                        message: "Just now",
                        suffix: "ago",
                        countDown: false,
                        showingSeconds: true
                    })}
                </td>
                <td className="block--txs--td">{blockRow.data && blockRow.data.length && blockRow.data.map ? <div className="block--txs">{blockRow.data.map((tx, index) => {
                    return <div className="block--tx" key={tx.hash}>
                        <TransactionPreview tx={tx} />
                    </div>;
                })}</div> : <span className="block--txs--none">No TXs</span>}</td>
            </tr>
        </CSSTransition>;
    };

    return <div className="selected-block">
        <div role="button" className="popup--x popup--x--white" onClick={onClose} />
        <h1>Block {blockNumber}</h1>
        <table>
            <thead>
                <tr>
                    <th>Block Number</th>
                    <th>Timestamp</th>
                    <th className="renvm--table--txs">Transactions</th>
                </tr>
            </thead>
            {block ?
                <TransitionGroup component="tbody">
                    {blockTr(block)}
                </TransitionGroup> :
                block === null ?
                    <tbody><tr><td colSpan={3}>Block not found</td></tr></tbody> :
                    <tbody><tr><td colSpan={3}><Loading alt={true} /></td></tr></tbody>
            }
        </table>
        <h2>Transactions</h2>
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
                {block ?
                    block.data && block.data.length > 0 && block.data.map ?
                        block.data.map(tx => {
                            const bindedOnTxClick = () => onTxClick(tx.hash);
                            return (
                                <tr key={tx.hash} onClick={bindedOnTxClick}>
                                    <td className="block--tx" key={tx.hash}>
                                        <TransactionPreview tx={tx} />
                                    </td>
                                    <td className="monospace">{tx.hash}</td>
                                    <td className="monospace">{tx.to}</td>
                                    <td>{tx.in.length}</td>
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
    </div>;
});
