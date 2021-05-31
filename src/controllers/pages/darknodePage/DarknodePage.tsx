import * as qs from "query-string";

import React, { useEffect, useState } from "react";
import { useLocation, useRouteMatch } from "react-router-dom";
import { toChecksumAddress } from "web3-utils";

import { darknodeIDBase58ToHex } from "../../../lib/darknode/darknodeID";
import { RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { objectify } from "../../../lib/general/debugUtils";
import { NetworkContainer } from "../../../store/networkContainer";
import { UIContainer } from "../../../store/uiContainer";
import { Web3Container } from "../../../store/web3Container";
import { NotFound } from "../../../views/404";
import { ErrorBoundary } from "../../common/ErrorBoundary";
import { DarknodeView } from "./DarknodeView";

export enum DarknodeAction {
    View = "view",
    Register = "register",
    Deregister = "deregister",
}

export const getDarknodeParam = (params: {
    darknodeID?: string;
}): string | undefined => {
    const { darknodeID: darknodeID58 } = params;
    let darknodeID;
    if (darknodeID58) {
        try {
            // Convert from base-58 to hex
            darknodeID =
                darknodeID58.slice(0, 2) === "0x"
                    ? toChecksumAddress(darknodeID58)
                    : darknodeIDBase58ToHex(darknodeID58);
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
 * 1) action: either "register" or "deregister"
 * 2) public_key: only used if action is "register"
 */
export const DarknodePage = () => {
    const { address } = Web3Container.useContainer();
    const { selectedDarknodeID, setSelectedDarknodeID } =
        UIContainer.useContainer();
    const {
        darknodeDetails,
        darknodeNames,
        storeDarknodeName,
        addRegisteringDarknode,
        fetchBlockState,
    } = NetworkContainer.useContainer();

    useEffect(() => {
        fetchBlockState().catch(console.error);
    }, [fetchBlockState]);

    // const [darknodeID, setDarknodeID] = useState<string | undefined>(undefined);
    const [action, setAction] = useState<string | undefined>(undefined);
    // const [providedName, setProvidedName] = useState<string | undefined>(undefined);

    const location = useLocation();
    const { params }: { params: { darknodeID?: string } } = useRouteMatch();
    const urlDarknodeID: string | undefined = getDarknodeParam(params);

    const [firstTime, setFirstTime] = useState(true);

    useEffect(() => {
        setSelectedDarknodeID(urlDarknodeID);

        // Clear selected darknode when the page is un-mounted.
        return () => {
            setSelectedDarknodeID(undefined);
        };
    }, [urlDarknodeID, setSelectedDarknodeID]);

    const darknodeOrURL = selectedDarknodeID || urlDarknodeID;

    useEffect(() => {
        const queryParams = qs.parse(location.search);
        const urlAction =
            typeof queryParams.action === "string"
                ? queryParams.action
                : undefined;
        const urlName =
            typeof queryParams.name === "string" ? queryParams.name : undefined;

        if (
            darknodeOrURL &&
            urlAction === DarknodeAction.Register &&
            urlName !== undefined
        ) {
            storeDarknodeName(darknodeOrURL, urlName);
        }

        if (
            darknodeOrURL &&
            urlAction === DarknodeAction.Register &&
            firstTime
        ) {
            addRegisteringDarknode(darknodeOrURL);
            setFirstTime(false);
        }

        setAction(urlAction);
        // setProvidedName(name);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const details = darknodeOrURL
        ? darknodeDetails.get(darknodeOrURL, null)
        : null;
    const name = darknodeOrURL ? darknodeNames.get(darknodeOrURL) : undefined;

    let readOnly = true;
    try {
        readOnly =
            !details ||
            !address ||
            details.operator.toLowerCase() !== address.toLowerCase();
    } catch (error) {
        console.error(error);
    }

    let darknodeAction = DarknodeAction.View;
    if (
        action === DarknodeAction.Register &&
        (!details ||
            details.registrationStatus === RegistrationStatus.Unregistered)
    ) {
        // If the URL action is Register, and the darknode has no details or is unregistered
        darknodeAction = action;
    } else if (
        action === DarknodeAction.Deregister &&
        details &&
        details.registrationStatus === RegistrationStatus.Registered
    ) {
        // If the URL action is Deregister, and the darknode is registered
        darknodeAction = action;
    }

    if (!darknodeOrURL) {
        return <NotFound />;
    }
    console.log("details", objectify(details));
    console.log("cycleStatus", objectify(objectify(details).cycleStatus));
    // TODO: fees here are fees visible under "withdrawable" - the exact amounts
    console.log("feesEarned", objectify(objectify(details).feesEarned));
    return (
        <ErrorBoundary>
            <DarknodeView
                storeDarknodeName={storeDarknodeName}
                key={darknodeOrURL}
                action={darknodeAction}
                name={name}
                darknodeID={darknodeOrURL}
                isOperator={!readOnly}
                darknodeDetails={details}
            />
        </ErrorBoundary>
    );
};
