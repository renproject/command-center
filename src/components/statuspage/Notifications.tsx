import * as React from "react";

import BigNumber from "bignumber.js";

import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { RegistrationStatus } from "../../actions/statistics/operatorActions";
import { DarknodeDetails } from "../../reducers/types";

const lowValue = new BigNumber(Math.pow(10, 18)).multipliedBy(0.1);

interface Props {
    isOperator: boolean;
    darknodeDetails: DarknodeDetails | null;
}

interface State {
}

export class Notifications extends React.Component<Props, State> {

    public constructor(props: Props, context: object) {
        super(props, context);
        this.state = {
        };
    }

    public render = (): JSX.Element => {
        const { isOperator, darknodeDetails } = this.props;

        let notification;
        if (
            isOperator &&
            darknodeDetails &&
            darknodeDetails.registrationStatus === RegistrationStatus.RegistrationPending
        ) {
            notification = {
                title: "Registration in progress!",
                detail: "Your darknode will be registered within 24 hours.",
            };
        } else if (
            isOperator &&
            darknodeDetails &&
            darknodeDetails.registrationStatus === RegistrationStatus.DeregistrationPending
        ) {
            notification = {
                title: "Deregistration in progress.",
                detail: "Your darknode will be deregistered within 24 hours.",
            };
        } else if (
            isOperator &&
            darknodeDetails &&
            darknodeDetails.registrationStatus === RegistrationStatus.Deregistered
        ) {
            notification = {
                title: "Darknode deregistered.",
                detail: "You will be able to withdraw your REN within 24 hours.",
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
            };
        }

        return (
            <div className="statuspage--banner-right">
                {notification ? <div className="statuspage--notification">
                    <FontAwesomeIcon icon={faInfoCircle} />
                    <div className="statuspage--notification--details">
                        <h2>{notification.title}</h2>
                        <span>{notification.detail}</span>
                    </div>
                </div> : null}
            </div>
        );
    }
}
