import * as React from "react";

import { connect } from "react-redux";

import { ApplicationData } from "@Reducers/types";

const metamaskIcon = require("../../styles/images/metamask.svg");

interface StoreProps {
}

interface NoMetaMaskProps extends StoreProps {
    onConnect: () => void;
    onCancel: () => void;
}

interface NoMetaMaskState {
}

/**
 * NoMetaMask is a popup component for prompting a user to select an
 * Ethereum account
 */
class NoMetaMask extends React.Component<NoMetaMaskProps, NoMetaMaskState> {
    constructor(props: NoMetaMaskProps) {
        super(props);
        this.state = {
        };
    }

    public async componentDidMount() {
        //
    }

    public render(): JSX.Element {
        return (
            <div className="popup no-metamask">
                <img className="no-metamask--logo" src={metamaskIcon} />
                <h2>You must connect a wallet to access your darknodes.</h2>
                <p>The Darknode Command Center requires permission to view your account address.</p>
                <button className="styled-button styled-button--light" onClick={this.props.onCancel}>Not now</button>
                <button className="styled-button" onClick={this.props.onConnect}>Connect</button>
            </div>
        );
    }
}


function mapStateToProps(state: ApplicationData): StoreProps {
    return {
    };
}

export default connect(mapStateToProps)(NoMetaMask);
