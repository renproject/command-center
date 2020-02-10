import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { className } from "../../../lib/react/className";
import { ApplicationState } from "../../../store/applicationState";
import { AppDispatch } from "../../../store/rootReducer";
import { _catch_ } from "../ErrorBoundary";

/**
 * PopupController is a visual component for displaying an arbitrary component in the
 * foreground with the rest of the page in the background
 */
class PopupControllerClass extends React.Component<Props> {
    public render(): JSX.Element | null {
        const { popup, overlay, onCancel } = this.props.store.popup;

        return (<>
            <div className={className("popup--container", popup && overlay ? "popup--blur" : "")}>
                {this.props.children}
            </div>
            {popup ? <div className="popup--outer">
                {_catch_(popup, { popup: true, onCancel })}
                {overlay ?
                    <div role="none" className="overlay" onClick={this.onClickHandler} /> : null}
            </div> : null}
        </>
        );
    }

    public onClickHandler = () => {
        const { dismissible, onCancel } = this.props.store.popup;
        if (dismissible) {
            onCancel();
        }
    }
}

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        popup: state.popup,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
}

export const PopupController = connect(mapStateToProps, mapDispatchToProps)(PopupControllerClass);
