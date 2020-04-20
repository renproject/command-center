import * as qs from "query-string";
import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { RouteComponentProps, withRouter } from "react-router-dom";
import { bindActionCreators } from "redux";

import { darknodeIDBase58ToHex } from "../../lib/darknode/darknodeID";
import { RegistrationStatus } from "../../lib/ethereum/contractReads";
import { ApplicationState } from "../../store/applicationState";
import { addRegisteringDarknode, setDarknodeName } from "../../store/network/operatorActions";
import { AppDispatch } from "../../store/rootReducer";
import { NotFound } from "../common/404";
import { _catch_ } from "../common/ErrorBoundary";
import { StatusPage } from "./statuspage/StatusPage";

export enum DarknodeAction {
    View = "view",
    Register = "register",
    Deregister = "deregister",
}

export const getDarknodeParam = (params: unknown): string | undefined => {
    const { darknodeID: darknodeID58 } = params as { darknodeID: string | undefined };
    let darknodeID;
    if (darknodeID58) {
        try {
            // Convert from base-58 to hex
            darknodeID = darknodeIDBase58ToHex(darknodeID58);
        } catch (error) {
            // If the darknode ID is malformatted, ignore it
            console.error(error);
            darknodeID = undefined;
        }
    }
    return darknodeID;
};

/**
 * Darknode shows the details of a darknode. The user does not have to be logged
 * in.
 *
 * URL parameters:
 *     1) action: either "register" or "deregister"
 *     2) public_key: only used if action is "register"
 */
const DarknodeClass: React.StatelessComponent<Props> = ({ store: { darknodeDetails, darknodeNames, address }, match, location, actions }) => {

    const [darknodeID, setDarknodeID] = React.useState<string | undefined>(undefined);
    const [action, setAction] = React.useState<string | undefined>(undefined);
    const [publicKey, setPublicKey] = React.useState<string | undefined>(undefined);
    // const [providedName, setProvidedName] = React.useState<string | undefined>(undefined);

    const urlDarknodeID: string | undefined = getDarknodeParam(match.params);

    const [firstTime, setFirstTime] = React.useState(true);

    React.useEffect(() => {
        setDarknodeID(urlDarknodeID);
    }, [urlDarknodeID]);

    React.useEffect(() => {
        const queryParams = qs.parse(location.search);
        const urlAction = typeof queryParams.action === "string" ? queryParams.action : undefined;
        const urlPublicKey = typeof queryParams.public_key === "string" ? queryParams.public_key : undefined;
        const urlName = typeof queryParams.name === "string" ? queryParams.name : undefined;

        if (darknodeID && urlAction === DarknodeAction.Register && urlName !== undefined) {
            actions.setDarknodeName({ darknodeID, name: urlName });
        }

        if (darknodeID && urlAction === DarknodeAction.Register && firstTime && urlPublicKey) {
            actions.addRegisteringDarknode({ darknodeID, publicKey: urlPublicKey });
            setFirstTime(false);
        }

        setAction(urlAction);
        setPublicKey(urlPublicKey);
        // setProvidedName(name);
    }, [location.search]);

    const details = darknodeID ? darknodeDetails.get(darknodeID, null) : null;
    const name = darknodeID ? darknodeNames.get(darknodeID) : undefined;

    const readOnly = !details || !address || details.operator !== address;

    let darknodeAction = DarknodeAction.View;
    if (
        (action === DarknodeAction.Register) &&
        (!details || details.registrationStatus === RegistrationStatus.Unregistered)
    ) {
        // If the URL action is Register, and the darknode has no details or is unregistered
        darknodeAction = action;
    } else if ((action === DarknodeAction.Deregister) &&
        details &&
        details.registrationStatus === RegistrationStatus.Registered
    ) {
        // If the URL action is Deregister, and the darknode is registered
        darknodeAction = action;
    }

    if (!darknodeID) {
        return <NotFound />;
    }

    return _catch_(<StatusPage
        key={darknodeID}
        action={darknodeAction}
        publicKey={publicKey}
        name={name}
        darknodeID={darknodeID}
        isOperator={!readOnly}
        darknodeDetails={details}
    />);
};

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.account.address,
        darknodeDetails: state.network.darknodeDetails,
        darknodeNames: state.network.darknodeNames,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        setDarknodeName,
        addRegisteringDarknode,
    }, dispatch),
});

interface Props extends
    ReturnType<typeof mapStateToProps>,
    ConnectedReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
}

export const Darknode = connect(mapStateToProps, mapDispatchToProps)(withRouter(DarknodeClass));
