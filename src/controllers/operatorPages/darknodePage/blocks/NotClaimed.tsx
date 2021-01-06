import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink, URLs } from "../../../../views/ExternalLink";

import { Popup } from "../../../common/popups/Popup";

interface Props {
    darknode?: string;
    onCancel(): void;
}

/**
 * LoggedOut is a popup component for warning the user that their node has not
 * claimed it's rewards for the previous epoch.
 */
export const NotClaimed: React.FC<Props> = ({ darknode, onCancel }) => {
    return (
        <Popup className="no-web3 popup--logged-out" onCancel={onCancel}>
            <h2>Rewards not claimed</h2>
            <div className="popup--description">
                {darknode ? (
                    <Link to={`/darknode/${darknode}`}>One of your nodes</Link>
                ) : (
                    <>Your node</>
                )}{" "}
                hasn't claimed its fees for this epoch.
                <br />
                Make sure your node has enough ETH, and try{" "}
                <ExternalLink href={URLs.restartDarknode}>
                    restarting your node
                </ExternalLink>{" "}
                using the CLI.
                <br />
                If the problem persists, please{" "}
                <ExternalLink href={URLs.feedbackButton}>
                    reach out
                </ExternalLink>{" "}
                to the Ren team before the end of the current epoch.
            </div>
        </Popup>
    );
};
