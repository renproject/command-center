import * as React from "react";

import { Language } from "../../../languages/language";
import { getWeb3BrowserIcon } from "../../../lib/ethereum/browsers";
import { Web3Container } from "../../../store/web3Store";

interface Props {
    message?: string;
    disabled?: boolean;
    onConnect(): void;
    onCancel(): void;
}

export const NoWeb3Popup: React.StatelessComponent<Props> = ({ message, disabled, onCancel, onConnect }) => {
    const { web3BrowserName } = Web3Container.useContainer();
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
