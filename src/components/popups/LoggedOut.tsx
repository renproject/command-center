import * as React from "react";

import { connect } from "react-redux";

import { ApplicationData } from "@Reducers/types";

const metamaskIcon = require("../../styles/images/metamask.svg");

interface StoreProps {
}

interface LoggedOutProps extends StoreProps {
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
            <div className="popup no-metamask">
                <img className="no-metamask--logo" src={metamaskIcon} />
                <h2>Your Web3 account was logged out.</h2>
                <p>Connect again to continue operating your darknodes.</p>
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

export const LoggedOut = connect(mapStateToProps)(LoggedOutClass);
