import * as React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { clearAlert } from "../actions/alert/alertActions";
import { ApplicationData } from "../reducers/types";

interface AlertsProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
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
        const { message } = nextProps.store.alert;
        if (message === null || message === this.props.store.alert.message) {
            return;
        }

        // Hide alert after 10 seconds.
        if (this.alertInterval) { clearTimeout(this.alertInterval); }
        this.alertInterval = setTimeout(() => {
            this.props.actions.clearAlert();
        }, 10 * 1000);
    }

    public render(): JSX.Element | null {
        const { message, alertType } = this.props.store.alert;
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

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        alert: state.alert.alert,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        clearAlert,
    }, dispatch),
});

export const Alerts = connect(mapStateToProps, mapDispatchToProps)(AlertsClass);
