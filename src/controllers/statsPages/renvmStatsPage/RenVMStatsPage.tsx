import { RenVMType } from "@renproject/interfaces";
import { Loading, naturalTime } from "@renproject/react-components";
import BigNumber from "bignumber.js";
import React, { useCallback, useEffect } from "react";
import { useHistory, useRouteMatch } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import { Token } from "../../../lib/ethereum/tokens";
import { EncodedData } from "../../../lib/general/encodedData";
import { Stat, Stats } from "../../../views/Stat";
import { Search } from "../../common/Search";
import { TokenBalance } from "../../common/TokenBalance";
import { RenVMBlock } from "./RenVMBlock";
import { Block, RenVMContainer } from "./renvmContainer";
import { RenVMTransaction, TransactionPreview } from "./RenVMTransaction";

const lockedBtcInfoLabel = `The amount of BTC currently locked in RenVM. Note that this sometimes lags behind the
 amount present in the smart contract. This is because users might have locked BTC in RenVM but are yet to mint renBTC
 on Ethereum (usually because they are awaiting confirmations on the host chain).
`;

const lockedZecInfoLabel = `The amount of ZEC currently locked in RenVM. Note that this sometimes lags behind the amount
 present in the smart contract. This is because users might have locked ZEC in RenVM but are yet to mint renBTC on
 Ethereum (usually because they are awaiting confirmations on the host chain).`;

const lockedBchInfoLabel = `The amount of BCH currently locked in RenVM. Note that this sometimes lags behind the amount
 present in the smart contract. This is because users might have locked BCH in RenVM but are yet to mint renBTC on
 Ethereum (usually because they are awaiting confirmations on the host chain).`;

const infoLabels = {
  BTC: lockedBtcInfoLabel,
  ZEC: lockedZecInfoLabel,
  BCH: lockedBchInfoLabel,
};

export const RenVMStatsPage = () => {
  const {
    updateBlocks,
    getTransaction,
    getBlock,
    blocks,
    network,
    currentTransactionHash,
    currentTransaction,
    currentBlockNumber,
    currentBlock,
  } = RenVMContainer.useContainer();

  const history = useHistory();
  const {
    params,
  }: { params: { txHash?: string; blockNumber?: string } } = useRouteMatch();
  const txHash: string | undefined = params.txHash;
  const blockNumber = params.blockNumber
    ? parseInt(params.blockNumber, 10)
    : null;

  useEffect(() => {
    updateBlocks().catch(console.error);
    const interval = setInterval(() => {
      updateBlocks().catch(console.error);
    }, 1000 * 15); // 15 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (txHash) {
      getTransaction(txHash).catch(console.error);
    }
    const interval = setInterval(() => {
      if (txHash) {
        getTransaction(txHash, { skipCache: true }).catch(console.error);
      }
    }, 1000 * 10);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txHash]);

  useEffect(() => {
    if (blockNumber) {
      getBlock(blockNumber).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  const onTxClick = useCallback(
    (txHash64: string) => {
      const txHashHex = new EncodedData(
        txHash64,
        EncodedData.Encodings.BASE64
      ).toHex();
      history.push(`/renvm/tx/${txHashHex}`);
    },
    [history]
  );

  const onClick = useCallback(
    (clickedBlockNumber: number | string) => {
      history.push(`/renvm/block/${clickedBlockNumber}`);
    },
    [history]
  );

  const onClose = useCallback(() => {
    history.push(`/renvm/`);
  }, [history]);

  const blockTr = (block: Block) => {
    const trOnClick = () => onClick(block.header.height);
    return (
      <CSSTransition
        key={block.header.height}
        classNames="fade"
        timeout={{ enter: 1000, exit: 1000 }}
      >
        <tr
          key={block.header.height}
          onClick={trOnClick}
          className="block--row"
        >
          <td>{block.header.height}</td>
          <td>
            {naturalTime(block.header.timestamp, {
              message: "Just now",
              suffix: "ago",
              countDown: false,
              showingSeconds: true,
            })}
          </td>
          <td className="block--txs--td">
            {block.data && block.data.length && block.data.map ? (
              <div className="block--txs">
                {block.data.map((tx, index) => {
                  return (
                    <div className="block--tx" key={tx.hash}>
                      <TransactionPreview tx={tx} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="block--txs--none">No TXs</span>
            )}
          </td>
        </tr>
      </CSSTransition>
    );
  };

  const firstBlock = blocks ? blocks.first<Block | null>(null) : null;

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
      if (state.type === RenVMType.ExtTypeBtcCompatUTXOs) {
        const token = state.name.replace("UTXOs", "").toUpperCase();
        lockedBalances[token] = (
          <Stat
            key={token}
            message={`Locked ${token}`}
            infoLabel={infoLabels[token]}
            big
          >
            <TokenBalance
              token={token as Token}
              amount={
                state && state.value
                  ? state.value
                      .reduce(
                        (sum, utxo) => sum.plus(utxo.amount || "0"),
                        new BigNumber(0)
                      )
                      .toFixed()
                  : 0
              }
              digits={4}
            />{" "}
            {token}
          </Stat>
        );
      }
      return null;
    });
  }

  // Override the order of the tokens (returned back in alphabetical order)
  const {
    [Token.BTC]: lockedBTC,
    [Token.ZEC]: lockedZEC,
    ...remainingLockedBalances
  } = lockedBalances;

  const search = <Search />;

  return (
    <div
      className="renvm container"
      key={blockNumber === null ? undefined : blockNumber}
    >
      <div className="medium-only">{search}</div>
      <Stats>
        <Stat message="Number of shards" big>
          1
        </Stat>
        <Stat
          message="Block height"
          big
          infoLabel="The number of blocks preceding it in the blockchain."
        >
          {firstBlock ? firstBlock.header.height : 0}
        </Stat>
        {lockedBTC}
        {lockedZEC}
        {remainingLockedBalances
          ? Object.values(remainingLockedBalances)
          : null}
      </Stats>
      <div className="no-medium">{search}</div>
      {txHash ? (
        <RenVMTransaction
          network={network}
          txHash={txHash}
          transaction={
            currentTransactionHash === txHash ? currentTransaction : undefined
          }
          onClose={onClose}
        />
      ) : null}
      {blockNumber || blockNumber === 0 ? (
        <RenVMBlock
          blockNumber={blockNumber}
          block={currentBlockNumber === blockNumber ? currentBlock : undefined}
          onClose={onClose}
          onTxClick={onTxClick}
          onBlockClick={onClick}
        />
      ) : null}
      <Stat message="Latest blocks">
        <table>
          <thead>
            <tr>
              <th>
                <span className="no-xs">Block Number</span>
                <span className="xs-only">#</span>
              </th>
              <th>Timestamp</th>
              <th className="renvm--table--txs">Transactions</th>
            </tr>
          </thead>
          {blocks ? (
            <TransitionGroup component="tbody">
              {blocks.map(blockTr).toArray()}
            </TransitionGroup>
          ) : (
            <tbody>
              <tr>
                <td colSpan={3}>
                  <Loading alt={true} />
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </Stat>
    </div>
  );
};
