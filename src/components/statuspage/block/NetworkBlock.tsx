import * as React from "react";

import { faServer } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DarknodeDetails } from "@Reducers/types";
import { Block, BlockBody, BlockTitle } from "./Block";

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
    network: string;
    darknodeDetails: DarknodeDetails | null;
}

export const NetworkBlock = (props: NetworkBlockProps) => {
    const { darknodeDetails } = props;
    return (

        <Block className="network-block">
            {/* {showAdvanced ? <div className="block--basic--hide" onClick={this.toggleAdvanced}>
                <FontAwesomeIcon icon={faTimes} pull="left" />
            </div> : null} */}

            <BlockTitle>
                <h3>
                    <FontAwesomeIcon icon={faServer} pull="left" />
                    Network Information
                    </h3>
            </BlockTitle>

            {darknodeDetails ? <BlockBody>
                <div className="network-block--info">
                    <div className="darknode-info">
                        <span className="darknode-info--title">Network:</span> <span>{props.network}</span>
                    </div>
                    <div className="darknode-info">
                        <span className="darknode-info--title">Connected Peers:</span> <span>{darknodeDetails.peers}</span>
                    </div>
                    <CopyBlock value={darknodeDetails.multiAddress}>Multi-address</CopyBlock>
                    <CopyBlock value={darknodeDetails.ID}>Ethereum Address</CopyBlock>
                    <CopyBlock value={darknodeDetails.publicKey}>Public Key</CopyBlock>
                </div>
            </BlockBody> : null}
        </Block>
    );
};
