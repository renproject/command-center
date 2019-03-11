import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import { ApplicationData } from "../../store/types";
import { EmptyDarknodeList } from "../darknodeList/EmptyDarknodeList";

/**
 * LoggingIn is a page whose principal components are wallet selection to allow users
 * to log-in, and the hidden orderbook
 */
class LoggingInClass extends React.Component<Props, State> {
    public constructor(props: Props, context: object) {
        super(props, context);
        this.state = {
            checkingVerification: false,
        };
    }

    public render = (): JSX.Element => {

        return (
            <div className="logging-in">
                <EmptyDarknodeList />
            </div>
        );
    }
}

const mapStateToProps = (_state: ApplicationData) => ({
    store: {
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
}

interface State {
}

export const LoggingIn = connect(mapStateToProps, mapDispatchToProps)(LoggingInClass);
