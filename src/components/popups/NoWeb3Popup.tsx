import * as React from "react";

import { Language } from "../../languages/language";

const metamaskIcon = require("../../styles/images/metamask.svg");

interface Props {
    message?: string;
    disabled?: boolean;
    onConnect: () => void;
    onCancel: () => void;
}

interface State {
}

export class NoWeb3Popup extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
        };
    }

    public render = (): JSX.Element => {
        const { message, disabled } = this.props;
        return (
            <div className="popup no-web3">
                <img className="no-web3--logo" src={metamaskIcon} />
                <h2>{message || Language.wallet.mustConnect}</h2>
                <button className="styled-button styled-button--light" onClick={this.props.onCancel}>Not now</button>
                <button className="styled-button" disabled={disabled} onClick={this.props.onConnect}>Retry</button>
            </div>
        );
    }
}
