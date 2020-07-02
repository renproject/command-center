import * as React from "react";

import {
    faExclamationTriangle, faInfoCircle, faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { RenNetworkDetails } from "@renproject/contracts";
import { naturalTime } from "@renproject/react-components";
import BigNumber from "bignumber.js";

import { RegistrationStatus } from "../../lib/ethereum/contractReads";
import { isDefined } from "../../lib/general/isDefined";
import { GraphContainer } from "../../store/graphStore";
import { DarknodesState } from "../../store/networkContainer";
import { SECONDS } from "../common/BackgroundTasks";

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

interface Props {
    isOperator: boolean;
    darknodeDetails: DarknodesState | null;
    renNetwork: RenNetworkDetails;
}

export const Notifications: React.FC<Props> = ({ isOperator, darknodeDetails, renNetwork }) => {

    const { renVM } = GraphContainer.useContainer();
    const { timeUntilNextEpoch, timeSinceLastEpoch } = renVM || { timeUntilNextEpoch: null, timeSinceLastEpoch: null };

    const [currentTime, setCurrentTime] = React.useState<number | null>(null);
    React.useEffect(() => {
        setCurrentTime(new Date().getTime() / SECONDS);
    }, [timeSinceLastEpoch]);

    const nextEpochReadable = isDefined(currentTime) && isDefined(timeUntilNextEpoch) ? naturalTime(currentTime + timeUntilNextEpoch.toNumber(), {
        prefix: "in",
        message: "next epoch",
        countDown: true,
        showingSeconds: false
    }) : "";

    let notification;
    if (
        isOperator &&
        darknodeDetails &&
        darknodeDetails.registrationStatus === RegistrationStatus.RegistrationPending
    ) {
        notification = {
            title: "Registration in progress!",
            detail: `Your darknode will be registered ${nextEpochReadable}.`,
            type: NotificationType.Information,
        };
    } else if (
        isOperator &&
        darknodeDetails &&
        darknodeDetails.registrationStatus === RegistrationStatus.DeregistrationPending
    ) {
        notification = {
            title: "Deregistration in progress.",
            detail: `Your darknode will be deregistered ${nextEpochReadable}. Your bond will be locked for another epoch after that.`,
            type: NotificationType.Information,
        };
    } else if (
        isOperator &&
        darknodeDetails &&
        darknodeDetails.registrationStatus === RegistrationStatus.Deregistered
    ) {
        notification = {
            title: "Darknode deregistered.",
            detail: `You will be able to withdraw your bond ${nextEpochReadable}.`,
            type: NotificationType.Information,
        };
    } else if (
        isOperator &&
        darknodeDetails &&
        darknodeDetails.registrationStatus === RegistrationStatus.Registered &&
        darknodeDetails.ethBalance &&
        darknodeDetails.ethBalance.lt(lowValue)
    ) {
        notification = {
            title: "Low gas balance.",
            detail: "If your darknode runs out of ETH, it won't earn fees.",
            type: NotificationType.Warning,
        };
    }

    return (
        <div className="darknodePage--notifications">
            {notification ? <div className={`darknodePage--notification ${notification.type}`}>
                <FontAwesomeIcon icon={notificationType[notification.type] as FontAwesomeIconProps["icon"]} />
                <div className="darknodePage--notification--details">
                    <h2>{notification.title}</h2>
                    <span>{notification.detail}</span>
                </div>
            </div> : null}
        </div>
    );
};
