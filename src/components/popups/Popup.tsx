import * as React from "react";

import { connect } from "react-redux";

import { ApplicationData, PopupData } from "@Reducers/types";

interface StoreProps {
    popup: PopupData;
}

interface PopupProps extends StoreProps {
}

/**
 * Popup is a visual component for displaying an arbitrary component in the
 * foreground with the rest of the page in the background
 */
class Popup extends React.Component<PopupProps> {
    constructor(props: PopupProps) {
        super(props);
        this.onClickHandler = this.onClickHandler.bind(this);
    }

    public render(): JSX.Element | null {
        const { popup } = this.props.popup;
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
        const { dismissible, onCancel } = this.props.popup;
        if (dismissible) {
            onCancel();
        }
    }
}

function mapStateToProps(state: ApplicationData): StoreProps {
    return {
        popup: state.popup
    };
}

export default connect(mapStateToProps)(Popup);
