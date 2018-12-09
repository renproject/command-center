import * as React from "react";

import Web3 from "web3";

// import { CopyToClipboard } from "react-copy-to-clipboard";

import RenExSDK from "@renex/renex";
import { Registration } from "./Registration";

interface CopyBlockProps {
    value: string;
}

interface CopyBlockState {
    copied: boolean;
}

export class CopyBlock extends React.Component<CopyBlockProps, CopyBlockState> {
    constructor(props: CopyBlockProps) {
        super(props);
        this.state = {
            copied: false
        };
    }

    public render(): JSX.Element {
        return (
            <label className="status">
                <div className="status--title">
                    {this.props.children}
                </div>
                <span className="status--item">
                    <input type="text" value={this.props.value} onClick={this.handleSelect} readOnly />
                    {/* <CopyToClipboard text={this.props.value} onCopy={this.handleCopy}>
                        <button>
                            <span>{!this.state.copied ? "Copy" : "Copied"}</span>
                        </button>
                    </CopyToClipboard> */}
                </span>
            </label>
        );
    }

    private handleSelect(e: React.MouseEvent<HTMLInputElement>): void {
        e.currentTarget.select();
    }
}

interface StatusBlockProps {
    sdk: RenExSDK;
    web3: Web3;
    registrationStatus: string;
    publicKey: string;
    network: string;
    multiAddress: string;
    darknodeAddress: string;
    peers: number;
    minBond: number;
}

export const StatusBlock = (props: StatusBlockProps) => {
    return (
        <>
            <h1>Darknode Information</h1>
            <Registration sdk={props.sdk} web3={props.web3} minBond={props.minBond} registrationStatus={props.registrationStatus} network={props.network} darknodeAddress={props.darknodeAddress} publicKey={props.publicKey} />
            <div className="status">
                <span className="status--title">Network:</span> <span>{props.network}</span>
            </div>
            <div className="status">
                <span className="status--title">Connected Peers:</span> <span>{props.peers}</span>
            </div>
            <CopyBlock value={props.multiAddress}>Multi-address</CopyBlock>
            <CopyBlock value={props.darknodeAddress}>Ethereum Address</CopyBlock>
            <CopyBlock value={props.publicKey}>Public Key</CopyBlock>
        </>
    );
};
