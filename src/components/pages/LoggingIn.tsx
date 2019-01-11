import * as React from "react";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { Header } from "../../components/Header";

import { EmptyDarknodeList } from "../../components/EmptyDarknodeList";
import { ApplicationData } from "../../reducers/types";

interface Props extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
}

interface State {
}

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
                {/* <Header hideOptions={true} /> */}
                <EmptyDarknodeList />
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

export const LoggingIn = connect(mapStateToProps, mapDispatchToProps)(LoggingInClass);
