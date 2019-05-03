import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { Language } from "../../languages/language";
import { getWeb3BrowserIcon } from "../../lib/ethereum/browsers";
import { ApplicationData } from "../../store/types";

export class NoWeb3PopupClass extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    public render = (): JSX.Element => {
        const { message, disabled } = this.props;
        const { web3BrowserName } = this.props.store;
        return (
            <div className="popup no-web3">
                <img
                    alt=""
                    role="presentation"
                    className="no-web3--logo"
                    src={getWeb3BrowserIcon(web3BrowserName)}
                />
                <h2>{message || Language.wallet.mustConnect}</h2>
                <button className="button button--white" onClick={this.props.onCancel}>Not now</button>
                <button className="button" disabled={disabled} onClick={this.props.onConnect}>Retry</button>
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
    message?: string;
    disabled?: boolean;
    onConnect(): void;
    onCancel(): void;
}

interface State {
}

export const NoWeb3Popup = connect(mapStateToProps, mapDispatchToProps)(NoWeb3PopupClass);
