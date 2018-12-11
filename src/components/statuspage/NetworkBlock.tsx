import * as React from "react";

import Web3 from "web3";

import RenExSDK from "@renex/renex";

interface CopyBlockProps {
    value: string;
}

interface CopyBlockState {
    copied: boolean;
}

class CopyBlock extends React.Component<CopyBlockProps, CopyBlockState> {
    constructor(props: CopyBlockProps) {
        super(props);
        this.state = {
            copied: false
        };
    }

    public render(): JSX.Element {
        return (
            <label className="darknode-info">
                <div className="darknode-info--title">
                    {this.props.children}
                </div>
                <span className="darknode-info--item">
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

interface NetworkBlockProps {
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

export const NetworkBlock = (props: NetworkBlockProps) => {
    return (
        <div className="block network-block">
            <div className="block--title">
                <h3>Darknode Information</h3>
            </div>
            <div className="darknode-info">
                <span className="darknode-info--title">Network:</span> <span>{props.network}</span>
            </div>
            <div className="darknode-info">
                <span className="darknode-info--title">Connected Peers:</span> <span>{props.peers}</span>
            </div>
            <CopyBlock value={props.multiAddress}>Multi-address</CopyBlock>
            <CopyBlock value={props.darknodeAddress}>Ethereum Address</CopyBlock>
            <CopyBlock value={props.publicKey}>Public Key</CopyBlock>
        </div>
    );
};
