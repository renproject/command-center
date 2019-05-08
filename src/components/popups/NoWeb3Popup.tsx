import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { Language } from "../../languages/language";
import { getWeb3BrowserIcon } from "../../lib/ethereum/browsers";
import { ApplicationData } from "../../store/types";

const NoWeb3PopupClass: React.StatelessComponent<Props> = (props) => {
    const { message, disabled, onCancel, onConnect } = props;
    const { web3BrowserName } = props.store;
    return <div className="popup no-web3">
        <img
            alt=""
            role="presentation"
            className="no-web3--logo"
            src={getWeb3BrowserIcon(web3BrowserName)}
        />
        <h2>{message || Language.wallet.mustConnect}</h2>
        <button className="button button--white" onClick={onCancel}>Not now</button>
        <button className="button" disabled={disabled} onClick={onConnect}>Retry</button>
    </div>;
};

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

export const NoWeb3Popup = connect(mapStateToProps, mapDispatchToProps)(NoWeb3PopupClass);
