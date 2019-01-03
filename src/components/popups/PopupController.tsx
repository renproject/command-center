import * as React from "react";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { ApplicationData } from "../../reducers/types";

interface PopupControllerProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
}

/**
 * PopupController is a visual component for displaying an arbitrary component in the
 * foreground with the rest of the page in the background
 */
class PopupControllerClass extends React.Component<PopupControllerProps> {
    constructor(props: PopupControllerProps) {
        super(props);
    }

    public render(): JSX.Element | null {
        const { popup, overlay } = this.props.store.popup;

        return (<>
            <div className={popup && overlay ? "popup--blur" : ""}>
                {this.props.children}
            </div>
            {popup ? <div className="popup--outer">
                {popup}
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

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        popup: state.popup,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

export const PopupController = connect(mapStateToProps, mapDispatchToProps)(PopupControllerClass);
