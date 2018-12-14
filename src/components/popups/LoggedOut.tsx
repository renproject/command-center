import * as React from "react";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { Blocky } from "@Components/Blocky";
import { ApplicationData } from "@Reducers/types";

const metamaskIcon = require("../../styles/images/metamask.svg");

interface LoggedOutProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    onConnect: () => void;
    onCancel: () => void;
    newAddress: string | null;
}

interface LoggedOutState {
}

/**
 * LoggedOut is a popup component for prompting a user to select an
 * Ethereum account
 */
class LoggedOutClass extends React.Component<LoggedOutProps, LoggedOutState> {
    constructor(props: LoggedOutProps) {
        super(props);
        this.state = {
        };
    }

    public async componentDidMount() {
        //
    }

    public render(): JSX.Element {
        const { newAddress } = this.props;
        return (
            <div className="popup no-web3 popup--logged-out">
                <img className="no-web3--logo" src={metamaskIcon} />
                {newAddress !== null ?
                    <>
                        <h2>Your Web3 account has changed.</h2>
                        <div className="popup--description">Connect to continue as <Blocky address={newAddress} /> <span className="monospace">{newAddress.substring(0, 8)}...{newAddress.slice(-5)}</span>.</div>
                    </> :
                    <>
                        <h2>Your Web3 account has been logged out.</h2>
                        <div className="popup--description">Select an account to access your darknodes.</div>
                    </>
                }
                <button className="styled-button styled-button--light" onClick={this.props.onCancel}>Not now</button>
                <button className="styled-button" onClick={this.props.onConnect}>Connect</button>
            </div>
        );
    }
}


const mapStateToProps = (state: ApplicationData) => ({
    store: {
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});


export const LoggedOut = connect(mapStateToProps, mapDispatchToProps)(LoggedOutClass);
