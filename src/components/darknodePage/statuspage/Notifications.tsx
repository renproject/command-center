import * as React from "react";

import {
    faExclamationTriangle, faInfoCircle, faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RenNetworkDetails } from "@renproject/contracts";
import BigNumber from "bignumber.js";

import { RegistrationStatus } from "../../../lib/ethereum/contractReads";
import { DarknodesState } from "../../../store/applicationState";

const lowValue = new BigNumber(Math.pow(10, 18)).multipliedBy(0.01);

enum NotificationType {
    Warning = "notification--warning",
    Information = "notification--information",
    Error = "notification--error",
}

const notificationType = {
    [NotificationType.Warning]: faExclamationTriangle,
    [NotificationType.Information]: faInfoCircle,
    [NotificationType.Error]: faTimesCircle,
};

export const Notifications: React.StatelessComponent<Props> = (props) => {
    const { isOperator, darknodeDetails, renNetwork } = props;

    let notification;
    if (
        isOperator &&
        darknodeDetails &&
        darknodeDetails.registrationStatus === RegistrationStatus.RegistrationPending
    ) {
        notification = {
            title: "Registration in progress!",
            detail: `Your darknode will be registered within ${renNetwork.name === "chaosnet" ? "8 days" : "24 hours"}.`,
            type: NotificationType.Information,
        };
    } else if (
        isOperator &&
        darknodeDetails &&
        darknodeDetails.registrationStatus === RegistrationStatus.DeregistrationPending
    ) {
        notification = {
            title: "Deregistration in progress.",
            detail: `Your darknode will be deregistered within ${renNetwork.name === "chaosnet" ? "8 days" : "24 hours"}.`,
            type: NotificationType.Information,
        };
    } else if (
        isOperator &&
        darknodeDetails &&
        darknodeDetails.registrationStatus === RegistrationStatus.Deregistered
    ) {
        notification = {
            title: "Darknode deregistered.",
            detail: `You will be able to withdraw your REN within ${renNetwork.name === "chaosnet" ? "8 days" : "24 hours"}.`,
            type: NotificationType.Information,
        };
    } else if (
        isOperator &&
        darknodeDetails &&
        darknodeDetails.registrationStatus === RegistrationStatus.Registered &&
        darknodeDetails.ethBalance.lt(lowValue)
    ) {
        notification = {
            title: "Low gas balance.",
            detail: "If your darknode runs out of ETH, it won't earn fees.",
            type: NotificationType.Warning,
        };
    }

    return (
        <div className="statuspage--notifications">
            {notification ? <div className={`statuspage--notification ${notification.type}`}>
                <FontAwesomeIcon icon={notificationType[notification.type]} />
                <div className="statuspage--notification--details">
                    <h2>{notification.title}</h2>
                    <span>{notification.detail}</span>
                </div>
            </div> : null}
        </div>
    );
};

interface Props {
    isOperator: boolean;
    darknodeDetails: DarknodesState | null;
    renNetwork: RenNetworkDetails;
}
