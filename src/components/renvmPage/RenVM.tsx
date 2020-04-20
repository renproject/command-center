import { RenVMType } from "@renproject/interfaces";
import { Loading, naturalTime } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useCallback } from "react";
import { withRouter } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import { Token } from "../../lib/ethereum/tokens";
import { EncodedData } from "../../lib/general/encodedData";
import { Stat, Stats } from "../common/Stat";
import { TokenBalance } from "../common/TokenBalance";
import { RenVMBlock } from "./RenVMBlock";
import { Block, RenVMContainer } from "./renvmContainer";
import { RenVMTransaction, TransactionPreview } from "./RenVMTransaction";

// Returning a new object reference guarantees that a before-and-after
//   equivalence check will always be false, resulting in a re-render, even
//   when multiple calls to forceUpdate are batched.

// const useForceUpdate = () => {
//     const [, dispatch] = useState<{}>(Object.create(null));

//     // Turn dispatch(required_parameter) into dispatch().
//     return useCallback(
//         (): void => {
//             dispatch(Object.create(null));
//         },
//         [dispatch],
//     );
// };

export const RenVM = withRouter(({ match: { params }, history }) => {
    const container = RenVMContainer.useContainer();

    const txHash: string | undefined = params.txHash;

    const blockNumber = params.blockNumber
        ? parseInt(params.blockNumber, 10)
        : null;

    // const forceUpdate = useForceUpdate();

    React.useEffect(() => {
        container.updateBlocks().catch(console.error);
        const interval = setInterval(() => {
            container.updateBlocks().catch(console.error);
        }, 1000 * 7.5);
        return () => clearInterval(interval);
    }, []); // 7.5 seconds

    React.useEffect(() => {
        if (txHash) { container.getTransaction(txHash).catch(console.error); }
        const interval = setInterval(() => {
            if (txHash) { container.getTransaction(txHash, { skipCache: true }).catch(console.error); }
        }, 1000 * 10);
        return () => clearInterval(interval);
    }, [txHash]);

    React.useEffect(() => {
        if (blockNumber) {
            container.getBlock(blockNumber).catch(console.error);
        }
    }, [blockNumber]);

    const onTxClick = useCallback((txHash64: string) => {
        const txHashHex = new EncodedData(txHash64, EncodedData.Encodings.BASE64).toHex();
        history.push(`/renvm/tx/${txHashHex}`);
    }, [history]);

    const onClick = useCallback((clickedBlockNumber: number | string) => {
        history.push(`/renvm/block/${clickedBlockNumber}`);
    }, [history]);

    const onClose = useCallback(() => {
        history.push(`/renvm/`);
    }, [history]);

    const blockTr = (block: Block) => {
        const trOnClick = () => onClick(block.header.height);
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
                        <TransactionPreview tx={tx} />
                    </div>;
                })}</div> : <span className="block--txs--none">No TXs</span>}</td>
            </tr>
        </CSSTransition>;
    };

    const firstBlock = container.blocks ? container.blocks.first<Block | null>(null) : null;

    // Uncomment to enable live timestamps
    // if (firstBlock && getTimeMagnitude(firstBlock.header.timestamp, true)) {
    //     setTimeout(() => {
    //         forceUpdate();
    //     }, 1 * 1000);
    // }

    // For each locked token, create a <Stat> element
    // tslint:disable-next-line: no-any
    const lockedBalances: any = {};
    if (firstBlock && firstBlock.prevState && firstBlock.prevState.map) {
        firstBlock.prevState.map((state) => {
            if (state.type === RenVMType.ExtTypeBtcCompatUTXOs && state.name.match(/.*UTXOs/)) {
                const token = state.name.replace("UTXOs", "").toUpperCase();
                lockedBalances[token] = <Stat message={`Locked ${token}`} big>
                    <TokenBalance
                        token={token as Token}
                        amount={state && state.value ? state.value.reduce((sum, utxo) => sum.plus(utxo.amount || "0"), new BigNumber(0)).toFixed() : 0}
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
            {txHash ?
                <RenVMTransaction network={container.network} txHash={txHash} transaction={container.currentTransactionHash === txHash ? container.currentTransaction : undefined} onClose={onClose} /> :
                <></>
            }
            {blockNumber || blockNumber === 0 ?
                <RenVMBlock blockNumber={blockNumber} block={container.currentBlockNumber === blockNumber ? container.currentBlock : undefined} onClose={onClose} onTxClick={onTxClick} onBlockClick={onClick} /> :
                <></>
            }
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
