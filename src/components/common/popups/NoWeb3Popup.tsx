import * as React from "react";

import { Language } from "../../../languages/language";
import { Web3Container } from "../../../store/web3Store";
import { WalletIcons } from "./WalletIcons";

interface Props {
    message?: string;
    disabled?: boolean;
    onConnect(): void;
    onCancel(): void;
}

export const NoWeb3Popup: React.StatelessComponent<Props> = ({ message, disabled, onCancel, onConnect }) => {
    const { web3BrowserName } = Web3Container.useContainer();
    return <div className="popup no-web3">
        <WalletIcons web3BrowserName={web3BrowserName} />

        <h2>{message || Language.wallet.mustConnect}</h2>

        <div className="popup--buttons">
            <button className="button button--white" onClick={onCancel}>Not now</button>
            <button className="button" disabled={disabled} onClick={onConnect}>Retry</button>
        </div>
    </div>;
};
