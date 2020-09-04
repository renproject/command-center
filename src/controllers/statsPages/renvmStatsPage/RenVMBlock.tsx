import { Loading, naturalTime } from "@renproject/react-components";
import React from "react";

import { TitledSection } from "../../../views/TitledSection";
import { Block } from "./renvmContainer";
import { TransactionPreview } from "./RenVMTransaction";

interface Props {
    blockNumber: number;
    block: Block | null | undefined;
    onClose: () => void;
    onTxClick: (txHashHex: string) => void;
    onBlockClick: (bockNumber: number) => void;
}

export const RenVMBlock: React.FC<Props> = ({ blockNumber, onClose, onTxClick, block }) => {

    return <TitledSection
        onClose={onClose}
        top={<>
            <h1>Block {blockNumber}</h1>
            <span>
                {block && naturalTime(block.header.timestamp, {
                    message: "Just now",
                    suffix: "ago",
                    countDown: false,
                    showingSeconds: true
                })}
            </span>
            <span>
                {block && block.data && block.data.length} transactions
            </span>
        </>}>
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
    </TitledSection>;
};
