import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { darknodeIDHexToBase58 } from "../../../lib/darknode/darknodeID";
import { RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { ApplicationState, DarknodesState } from "../../../store/applicationState";
import { removeRegisteringDarknode } from "../../../store/network/operatorActions";
import { NetworkStateContainer } from "../../../store/networkStateContainer";
import { AppDispatch } from "../../../store/rootReducer";
import { Web3Container } from "../../../store/web3Store";
import { CardView } from "./CardView";

const mapStateToProps = (_state: ApplicationState) => ({
    store: {
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        removeRegisteringDarknode,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    darknodeID: string;
    darknodeDetails: DarknodesState | null;
    name: string | undefined;
    publicKey: string | undefined;
}

export const DarknodeCard = connect(mapStateToProps, mapDispatchToProps)(({ actions, darknodeID, darknodeDetails, name, publicKey }: Props) => {
    const { address, renNetwork: renNetwork } = Web3Container.useContainer();
    const { quoteCurrency, hideDarknode } = NetworkStateContainer.useContainer();

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

        // tslint:disable-next-line: await-promise
        if (continuable) {
            actions.removeRegisteringDarknode({ darknodeID });
        } else if (address) {
            hideDarknode({ darknodeID, operator: address, network: renNetwork.name });
        }
    }, [confirmedRemove, continuable, actions, address, darknodeID, renNetwork.name]);

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
});
