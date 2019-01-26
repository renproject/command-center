import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import { Blocky } from "../../components/Blocky";
import { getWeb3BrowserIcon } from "../../lib/ethereum/browsers";
import { ApplicationData } from "../../reducers/types";
import { _catch_ } from "../ErrorBoundary";

/**
 * LoggedOut is a popup component for prompting a user to select an
 * Ethereum account
 */
class LoggedOutClass extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    public componentDidMount = async (): Promise<void> => {
        //
    }

    public render = (): JSX.Element => {
        const { newAddress } = this.props;
        const { web3BrowserName } = this.props.store;
        return (
            <div className="popup no-web3 popup--logged-out">
                <img alt="" role="presentation" className="no-web3--logo" src={getWeb3BrowserIcon(web3BrowserName)} />
                {newAddress !== null ?
                    <>
                        <h2>Your Web3 account has changed.</h2>
                        <div className="popup--description">
                            Connect to continue as
                            {" "}
                            <Blocky address={newAddress} />
                            {" "}
                            <span className="monospace">
                                {newAddress.substring(0, 8)}...{newAddress.slice(-5)}
                            </span>.
                        </div>
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
        web3BrowserName: state.trader.web3BrowserName,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    newAddress: string | null;
    onCancel(): void;
    onConnect(): void;
}

interface State {
}

export const LoggedOut = connect(mapStateToProps, mapDispatchToProps)(LoggedOutClass);
