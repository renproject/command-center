import React from "react";
import { Blocky } from "@renproject/react-components";

import { isDefined } from "../../../lib/general/isDefined";
import { Web3Container } from "../../../store/web3Store";
import { WalletIcons } from "./WalletIcons";

interface Props {
    newAddress: string | null;
    onCancel(): void;
    onConnect(): void;
}

/**
 * LoggedOut is a popup component for prompting a user to select an
 * Ethereum account
 */
export const LoggedOut: React.FC<Props> = ({ newAddress, onCancel, onConnect }) => {
    const { web3BrowserName } = Web3Container.useContainer();
    return <div className="popup no-web3 popup--logged-out">
        <WalletIcons web3BrowserName={web3BrowserName} />

        {isDefined(newAddress) ?
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
        <div className="popup--buttons">
            <button className="button button--white" onClick={onCancel}>Not now</button>
            <button className="button button--blue" onClick={onConnect}>Connect</button>
        </div>
    </div>;
};
