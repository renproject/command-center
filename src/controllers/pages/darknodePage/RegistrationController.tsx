import React from "react";

import { RegistrationStatus } from "../../../lib/ethereum/contractReads";

import {
    DarknodesState,
    NetworkContainer,
} from "../../../store/networkContainer";
import { Web3Container } from "../../../store/web3Container";
import { Registration } from "../../../views/Registration";
import { DarknodeAction } from "./DarknodePage";

export const statusText = {
    [RegistrationStatus.Unknown]: "Loading...",
    [RegistrationStatus.Unregistered]: "Deregistered",
    [RegistrationStatus.RegistrationPending]: "Registration pending",
    [RegistrationStatus.Registered]: "Registered",
    [RegistrationStatus.DeregistrationPending]: "Deregistration pending",
    [RegistrationStatus.Deregistered]: "Awaiting Refund Period",
    [RegistrationStatus.Refundable]: "Refundable",
};

interface Props {
    registrationStatus: RegistrationStatus;
    action: DarknodeAction;
    darknodeID: string;
    darknodeDetails: DarknodesState | null;
}

export const RegistrationController: React.FC<Props> = ({
    darknodeID,
    action,
    darknodeDetails,
    registrationStatus,
}) => {
    const { address, promptLogin, web3BrowserName } =
        Web3Container.useContainer();
    const {
        unhideDarknode,
        updateDarknodeDetails,
        updateOperatorDarknodes,
        showRegisterPopup,
        showDeregisterPopup,
        showRefundPopup,
    } = NetworkContainer.useContainer();

    const onDone = async () => {
        await updateDarknodeDetails(darknodeID);
    };

    const loginCallback = async () => {
        // If the user is not logged in, prompt login. On mobile, it may not be
        // obvious to the user that they need to login.
        if (!address) {
            await promptLogin({ manual: true });
        }
    };

    const registerCallback = async (): Promise<void> => {
        if (!address) {
            return; // TODO: Show error.
        }

        await new Promise<void>((resolve, reject) => {
            showRegisterPopup(address, darknodeID, reject, resolve);
        });
        unhideDarknode(darknodeID, address);
        await updateOperatorDarknodes();
    };

    const deregisterCallback = async (): Promise<void> => {
        await new Promise<void>((resolve, reject) =>
            showDeregisterPopup(
                darknodeID,
                darknodeDetails && darknodeDetails.feesEarnedInUsd,
                reject,
                resolve,
            ),
        );

        onDone().catch(console.error);
    };

    const refundCallback = async (): Promise<void> => {
        if (!address) {
            return;
        }

        await new Promise<void>((resolve, reject) =>
            showRefundPopup(darknodeID, reject, resolve),
        );
        await onDone();
    };

    return (
        <Registration
            address={address}
            action={action}
            operator={darknodeDetails && darknodeDetails.operator}
            registrationStatus={registrationStatus}
            web3BrowserName={web3BrowserName}
            loginCallback={loginCallback}
            registerCallback={address ? registerCallback : undefined}
            deregisterCallback={address ? deregisterCallback : undefined}
            refundCallback={address ? refundCallback : undefined}
        />
    );
};
