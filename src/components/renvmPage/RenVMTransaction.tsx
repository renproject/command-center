import { RenNetworkDetails } from "@renproject/contracts";
import {
    Asset, RenContract, RenVMArg, RenVMArgs, RenVMType, TxStatus,
} from "@renproject/interfaces";
import { Loading, TokenIcon } from "@renproject/react-components";
import { ResponseQueryTx } from "@renproject/rpc";
import React from "react";

import { strip0x } from "../../lib/ethereum/contractReads";
import { Token } from "../../lib/ethereum/tokens";
import { EncodedData } from "../../lib/general/encodedData";
import { classNames } from "../../lib/react/className";
import { ExternalLink } from "../../views/ExternalLink";
import { Tx } from "./renvmContainer";

export const TransactionPreview = ({ tx }: { tx: Tx }) => {
    const [match, _token, _left, _right] = tx.to.match(/([A-Z0-9]*)0([A-Za-z0-0]*)2([A-Za-z0-0]*)/) || [];

    if (match) {
        const [token, left, right] = [_token.toUpperCase() as Token, _left.toUpperCase() as Token, _right.toUpperCase() as Token];

        const amount = tx.in.filter(arg => arg.name === "amount")[0];

        // if (token === left) {
        //     return <>Shift {amount && amount.value / 10 ** 8} {left} from <TokenIcon white={true} token={left} /> to <TokenIcon white={true} token={right} /></>;
        // } else if (token === right) {
        //     return <>Shift {amount && amount.value / 10 ** 8} {right} from <TokenIcon white={true} token={left} /> to <TokenIcon white={true} token={right} /></>;
        // }
        return <>Shift {amount && amount.value / 10 ** 8} {token} from <TokenIcon white={true} token={left} /> to <TokenIcon white={true} token={right} /></>;
    }
    return <>
        {tx.to} {tx.in.length} {tx.out ? tx.out.length : 0}
    </>;
};

const txUrl = (txHash: string, token: Asset, network: RenNetworkDetails): string => {
    const isTx = txHash && txHash.slice && txHash.match(/^(0x)?[a-fA-F0-9]+$/);
    switch (token) {
        case Asset.ETH:
            return `${network.etherscan}/tx/${txHash}`;
        case Asset.BTC:
            return `https://chain.so/${isTx ? "tx" : "address"}/BTC${network.networkID !== 1 ? "TEST" : ""}/${strip0x(txHash)}`;
        case Asset.ZEC:
            return `https://chain.so/${isTx ? "tx" : "address"}/ZEC${network.networkID !== 1 ? "TEST" : ""}/${strip0x(txHash)}`;
        case Asset.BCH:
            return `https://explorer.bitcoin.com/${network.networkID !== 1 ? "t" : ""}bch/${isTx ? "tx" : "address"}/${strip0x(txHash)}`;
    }
    return "";
};

const RenVMArgValue = ({ renContract, arg, network }: { renContract: RenContract, arg: RenVMArg<string, RenVMType>, network: RenNetworkDetails }) => {
    if (arg.name === "utxo") {

        const [match, _token, _left, _right] = renContract.match(/([A-Z0-9]*)0([A-Za-z0-0]*)2([A-Za-z0-0]*)/) || [];
        const { ghash, scriptPubKey, ...utxo } = arg.value;

        if (match) {
            const [token, ,] = [_token.toUpperCase() as Asset, _left.toUpperCase() as Token, _right.toUpperCase() as Token];
            const txHashHex = new EncodedData(utxo.txHash, EncodedData.Encodings.BASE64).toHex("");
            return <>{"{"}"amount": "{utxo.amount}", "txHash": "<ExternalLink href={txUrl(txHashHex, token, network)}>{utxo.txHash}</ExternalLink>", "vOut": "0" {"}"}</>;
        } else {
            return <>{JSON.stringify(utxo, null, " ")}</>;
        }
    }
    return <>{JSON.stringify(arg.value, null, " ")}</>;
};

const RenVMArgsTable = ({ title, args, renContract, network }: { renContract: RenContract, title: string, args: RenVMArgs, network: RenNetworkDetails }) => <>
    <h2>{title}</h2>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Type</th>
                <th colSpan={2}>Value</th>
            </tr>
        </thead>
        <tbody>
            {args.map(input => {
                return <tr key={input.name}>
                    <td>{input.name}</td>
                    <td className="monospace">{input.type}</td>
                    <td colSpan={2}><RenVMArgValue renContract={renContract} arg={input} network={network} /></td>
                </tr>;
            })}
        </tbody>
    </table>
</>;

interface Props {
    txHash: string;
    transaction: ResponseQueryTx | undefined | null;
    network: RenNetworkDetails;
    onClose: () => void;
}

export const RenVMTransaction: React.FC<Props> = ({ network, txHash, transaction, onClose }) => {
    const txHash64 = txHash ? new EncodedData(txHash, EncodedData.Encodings.HEX).toBase64() : undefined;

    return (
        <div className="selected-block renvm--transaction">
            <div role="button" className="popup--x popup--x--white" onClick={onClose} />
            <h1>Transaction <span className="monospace">{txHash64}</span></h1>
            {transaction ? <>
                <div className="block--txs">
                    <div className="block--tx"><TransactionPreview tx={transaction.tx} /></div>
                    <div className="block--tx">Status: <span className={classNames("block--tx--span", transaction.txStatus === TxStatus.TxStatusDone ? "green" : "orange")}>{(transaction.txStatus || "").toUpperCase()}</span></div>
                    <div className="block--tx">Contract: <span className="block--tx--span">{transaction.tx.to}</span></div>
                </div>
                <br />
                <RenVMArgsTable network={network} renContract={transaction.tx.to} title="Inputs" args={transaction.tx.in} />
                <br />
                {transaction.tx.autogen && transaction.tx.autogen.length > 0 ? <RenVMArgsTable network={network} renContract={transaction.tx.to} title="Generated values" args={transaction.tx.autogen} /> : <></>}
                <br />
                {transaction.tx.out && transaction.tx.out.length > 0 ? <RenVMArgsTable network={network} renContract={transaction.tx.to} title="Outputs" args={transaction.tx.out} /> : <></>}
                <br />

                <details>
                    <summary>Raw response</summary>
                    <pre><code className="monospace">
                        {JSON.stringify(transaction, null, "    ")}
                    </code></pre>
                </details>
            </> :
                transaction === null ? <>
                    Transaction not found
                        </> :
                    <Loading alt={true} />
            }
        </div>
    );
};
