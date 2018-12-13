import * as React from "react";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { ApplicationData } from "@Reducers/types";
import { Language } from "@Root/languages/language";

const metamaskIcon = require("../../styles/images/metamask.svg");

interface NoWeb3PopupProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    message?: string;
    onConnect: () => void;
    onCancel: () => void;
}

interface NoWeb3PopupState {
}

class NoWeb3PopupClass extends React.Component<NoWeb3PopupProps, NoWeb3PopupState> {
    constructor(props: NoWeb3PopupProps) {
        super(props);
        this.state = {
        };
    }

    public render(): JSX.Element {
        const { message } = this.props;
        return (
            <div className="popup no-web3">
                <img className="no-web3--logo" src={metamaskIcon} />
                <h2>{message || Language.wallet.mustConnect}</h2>
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

export const NoWeb3Popup = connect(mapStateToProps, mapDispatchToProps)(NoWeb3PopupClass);
