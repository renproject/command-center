import * as React from "react";

import { connect } from "react-redux";

import { ApplicationData, PopupData } from "@Reducers/types";
import { bindActionCreators, Dispatch } from "redux";

interface PopupProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
}

/**
 * Popup is a visual component for displaying an arbitrary component in the
 * foreground with the rest of the page in the background
 */
class PopupClass extends React.Component<PopupProps> {
    constructor(props: PopupProps) {
        super(props);
    }

    public render(): JSX.Element | null {
        const { popup } = this.props.store.popup;
        if (!popup) {
            return null;
        }

        return (
            <div className="popup--outer">
                {popup}
                {/* <div role="none" className="overlay" onClick={this.onClickHandler} /> */}
            </div>
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

export const Popup = connect(mapStateToProps, mapDispatchToProps)(PopupClass);
