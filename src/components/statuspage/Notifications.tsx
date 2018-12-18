import * as React from "react";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { RegistrationStatus } from "@Actions/statistics/operatorActions";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ApplicationData, DarknodeDetails } from "@Reducers/types";

interface NotificationsProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    operator: boolean;
    darknodeDetails: DarknodeDetails | null;
}

interface NotificationsState {
}

class NotificationsClass extends React.Component<NotificationsProps, NotificationsState> {

    public constructor(props: NotificationsProps, context: object) {
        super(props, context);
        this.state = {
        };
    }

    public render(): JSX.Element {
        const { operator, darknodeDetails } = this.props;

        let notification;
        if (operator && darknodeDetails && darknodeDetails.registrationStatus === RegistrationStatus.RegistrationPending) {
            notification = {
                title: "Registration in progress!",
                detail: "Your darknode will be registered within 24 hours.",
            };
        } else if (operator && darknodeDetails && darknodeDetails.registrationStatus === RegistrationStatus.DeregistrationPending) {
            notification = {
                title: "Deregistration in progress.",
                detail: "Your darknode will be deregistered within 24 hours.",
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

const mapStateToProps = (state: ApplicationData) => ({
    store: {
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

export const Notifications = connect(mapStateToProps, mapDispatchToProps)(NotificationsClass);

