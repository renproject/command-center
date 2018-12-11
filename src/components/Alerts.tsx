import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { clearAlert, ClearAlertAction } from "@Actions/alert/alertActions";
import { Alert, ApplicationData } from "@Reducers/types";

interface StoreProps {
    alert: Alert;
}

interface AlertsProps extends StoreProps {
    actions: {
        clearAlert: ClearAlertAction;
    };
}

interface AlertsState {
}


/**
 * Alerts is a visual component for displaying general alert messages.
 * Alerts can represent an Error, a Warning or a Success event.
 */
class AlertsClass extends React.Component<AlertsProps, AlertsState> {
    private alertInterval: NodeJS.Timer | undefined;

    public constructor(props: AlertsProps, context: object) {
        super(props, context);
    }

    public componentWillReceiveProps(nextProps: AlertsProps): void {
        const { message } = nextProps.alert;
        if (message === null || message === this.props.alert.message) {
            return;
        }

        // Hide alert after 10 seconds.
        if (this.alertInterval) { clearTimeout(this.alertInterval); }
        this.alertInterval = setTimeout(() => {
            this.props.actions.clearAlert();
        }, 10 * 1000);
    }

    public render(): JSX.Element | null {
        const { message } = this.props.alert;
        const { alertType } = this.props.alert;
        if (message === "") {
            return null;
        }
        return (
            <div role="alert" className={`alert ${alertType}`}>
                <span className="alert--message">{message}</span>
                <span role="button" className="alert--cross" onClick={this.handleClose}>&#x00D7;</span>
            </div>
        );
    }

    private handleClose = (): void => {
        if (this.alertInterval) { clearInterval(this.alertInterval); }
        this.props.actions.clearAlert();
    }
}

function mapStateToProps(state: ApplicationData): StoreProps {
    return {
        alert: state.alert.alert
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: AlertsProps["actions"] } {
    return {
        actions: bindActionCreators({
            clearAlert,
        }, dispatch)
    };
}

export const Alerts = connect(mapStateToProps, mapDispatchToProps)(AlertsClass);
