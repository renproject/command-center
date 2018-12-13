import * as React from "react";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { ApplicationData } from "@Reducers/types";

const metamaskIcon = require("../../styles/images/metamask.svg");

interface LoggedOutProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    onConnect: () => void;
    onCancel: () => void;
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
        return (
            <div className="popup no-web3">
                <img className="no-web3--logo" src={metamaskIcon} />
                <h2>Your Web3 account was logged out.</h2>
                <p>Connect again to continue operating your darknodes.</p>
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
