import * as React from "react";

import { Language } from "../../../languages/language";
import { getWeb3BrowserIcon } from "../../../lib/ethereum/browsers";
import { Web3Container } from "../../../store/web3Store";
import { ReactComponent as Brave } from "../../../styles/images/browsers/login/brave.svg";
import { ReactComponent as Coinbase } from "../../../styles/images/browsers/login/coinbase.svg";
import { ReactComponent as Imtoken } from "../../../styles/images/browsers/login/imtoken.svg";
import { ReactComponent as Metamask } from "../../../styles/images/browsers/login/metamask.svg";
import { ReactComponent as Status } from "../../../styles/images/browsers/login/status.svg";
import { ReactComponent as Trust } from "../../../styles/images/browsers/login/trust.svg";

interface Props {
    message?: string;
    disabled?: boolean;
    onConnect(): void;
    onCancel(): void;
}

export const NoWeb3Popup: React.StatelessComponent<Props> = ({ message, disabled, onCancel, onConnect }) => {
    const { web3BrowserName } = Web3Container.useContainer();
    return <div className="popup no-web3">
        {/* <img
            alt=""
            role="presentation"
            className="no-web3--logo"
            src={getWeb3BrowserIcon(web3BrowserName)}
        /> */}
        <div className="connect-web3--browsers">
            <a target="_blank" rel="noopener noreferrer" title="Metamask Web3 Browser" href="https://metamask.io/"><Metamask /></a>
            <a target="_blank" rel="noopener noreferrer" title="Coinbase Web3 Browser" href="https://wallet.coinbase.com/"><Coinbase /></a>
            <a target="_blank" rel="noopener noreferrer" title="Trust Web3 Browser" href="https://trustwallet.com/"><Trust /></a>
            <a target="_blank" rel="noopener noreferrer" title="Imtoken Web3 Browser" href="https://www.token.im/"><Imtoken /></a>
            <a target="_blank" rel="noopener noreferrer" title="Brave Web3 Browser" href="https://brave.com/"><Brave /></a>
            <a target="_blank" rel="noopener noreferrer" title="Status Web3 Browser" href="https://status.im"><Status /></a>
        </div>

        <h2>{message || Language.wallet.mustConnect}</h2>

        <div className="popup--buttons">
            <button className="button button--white" onClick={onCancel}>Not now</button>
            <button className="button" disabled={disabled} onClick={onConnect}>Retry</button>
        </div>
    </div>;
};
