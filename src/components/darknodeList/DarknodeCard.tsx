import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { ApplicationState, DarknodesState } from "../../store/applicationState";
import { AppDispatch } from "../../store/rootReducer";
import {
    RegistrationStatus, removeDarknode, removeRegisteringDarknode,
} from "../../store/statistics/operatorActions";
import { darknodeIDHexToBase58 } from "../pages/Darknode";
import { CardView } from "./CardView";

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.trader.address,
        quoteCurrency: state.statistics.quoteCurrency,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        removeRegisteringDarknode,
        removeDarknode,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    darknodeID: string;
    darknodeDetails: DarknodesState | null;
    name: string | undefined;
    publicKey: string | undefined;
}

export const DarknodeCard = connect(mapStateToProps, mapDispatchToProps)((props: Props) => {
    const { actions, darknodeID, darknodeDetails, name, store, publicKey } = props;
    const { address, quoteCurrency } = store;

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
            actions.removeDarknode({ darknodeID, operator: address });
        }
    }, [confirmedRemove, continuable, actions, address, darknodeID]);

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
