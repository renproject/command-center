import * as qs from "query-string";
import * as React from "react";

import { RouteComponentProps, withRouter } from "react-router-dom";

import { darknodeIDBase58ToHex } from "../../lib/darknode/darknodeID";
import { RegistrationStatus } from "../../lib/ethereum/contractReads";
import { NetworkStateContainer } from "../../store/networkStateContainer";
import { Web3Container } from "../../store/web3Store";
import { NotFound } from "../common/404";
import { _catch_ } from "../common/ErrorBoundary";
import { DarknodeView } from "./DarknodeView";

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
export const DarknodePage = withRouter(({ match, location }: Props) => {
    const { address } = Web3Container.useContainer();
    const { darknodeDetails, darknodeNames, storeDarknodeName: setDarknodeName, addRegisteringDarknode } = NetworkStateContainer.useContainer();

    const [darknodeID, setDarknodeID] = React.useState<string | undefined>(undefined);
    const [action, setAction] = React.useState<string | undefined>(undefined);
    const [publicKey, setPublicKey] = React.useState<string | undefined>(undefined);
    // const [providedName, setProvidedName] = React.useState<string | undefined>(undefined);

    const urlDarknodeID: string | undefined = getDarknodeParam(match.params);

    const [firstTime, setFirstTime] = React.useState(true);

    React.useEffect(() => {
        setDarknodeID(urlDarknodeID);
    }, [urlDarknodeID]);

    const darknodeOrURL = darknodeID || urlDarknodeID;

    React.useEffect(() => {
        const queryParams = qs.parse(location.search);
        const urlAction = typeof queryParams.action === "string" ? queryParams.action : undefined;
        const urlPublicKey = typeof queryParams.public_key === "string" ? queryParams.public_key : undefined;
        const urlName = typeof queryParams.name === "string" ? queryParams.name : undefined;

        if (darknodeOrURL && urlAction === DarknodeAction.Register && urlName !== undefined) {
            setDarknodeName(darknodeOrURL, urlName);
        }

        if (darknodeOrURL && urlAction === DarknodeAction.Register && firstTime && urlPublicKey) {
            addRegisteringDarknode(darknodeOrURL, urlPublicKey);
            setFirstTime(false);
        }

        setAction(urlAction);
        setPublicKey(urlPublicKey);
        // setProvidedName(name);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const details = darknodeOrURL ? darknodeDetails.get(darknodeOrURL, null) : null;
    const name = darknodeOrURL ? darknodeNames.get(darknodeOrURL) : undefined;

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

    if (!darknodeOrURL) {
        return <NotFound />;
    }

    return _catch_(<DarknodeView
        key={darknodeOrURL}
        action={darknodeAction}
        publicKey={publicKey}
        name={name}
        darknodeID={darknodeOrURL}
        isOperator={!readOnly}
        darknodeDetails={details}
    />);
});

interface Props extends RouteComponentProps {
}
