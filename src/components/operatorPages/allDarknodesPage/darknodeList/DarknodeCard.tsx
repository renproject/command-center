import * as React from "react";

import { darknodeIDHexToBase58 } from "../../../../lib/darknode/darknodeID";
import { RegistrationStatus } from "../../../../lib/ethereum/contractReads";
import { DarknodesState, NetworkContainer } from "../../../../store/networkContainer";
import { Web3Container } from "../../../../store/web3Store";
import { CardView } from "./CardView";

interface Props {
    darknodeID: string;
    darknodeDetails: DarknodesState | null;
    name: string | undefined;
    publicKey: string | undefined;
}

export const DarknodeCard: React.FC<Props> = ({ darknodeID, darknodeDetails, name, publicKey }) => {
    const { address } = Web3Container.useContainer();
    const { quoteCurrency, hideDarknode, removeRegisteringDarknode } = NetworkContainer.useContainer();

    const [confirmedRemove, setConfirmedRemove] = React.useState(false);

    // If we have the public key and the status is unregistered (or the status is not available yet), then link to
    // the registration page
    const continuable = (publicKey && (
        !darknodeDetails ||
        darknodeDetails.registrationStatus === RegistrationStatus.Unregistered
    )) || false;

    const handleRemoveDarknode = React.useCallback((): void => {
        if (!confirmedRemove) {
            setConfirmedRemove(true);
            return;
        }

        if (continuable) {
            removeRegisteringDarknode(darknodeID);
        } else if (address) {
            hideDarknode(darknodeID, address);
        }
    }, [confirmedRemove, continuable, removeRegisteringDarknode, address, darknodeID, hideDarknode]);

    const faded = darknodeDetails &&
        darknodeDetails.registrationStatus === RegistrationStatus.Unregistered &&
        !continuable;

    const hidable = (darknodeDetails && darknodeDetails.registrationStatus === RegistrationStatus.Unregistered) || continuable;

    const darknodeIDBase58 = darknodeIDHexToBase58(darknodeID);

    const url = continuable ?
        `/darknode/${darknodeIDBase58}?action=register&public_key=${publicKey}` :
        `/darknode/${darknodeIDBase58}`;

    return <CardView
        darknodeID={darknodeID}
        darknodeDetails={darknodeDetails}
        name={name}
        quoteCurrency={quoteCurrency}
        url={url}
        faded={faded}
        hidable={hidable}
        confirmedRemove={confirmedRemove}
        removeDarknode={handleRemoveDarknode}
        continuable={continuable}
    />;
};
