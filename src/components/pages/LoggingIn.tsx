import * as React from "react";

import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { Header } from "@Components/Header";
import { Sidebar } from "@Components/Sidebar";

import { setAlert } from "@Actions/alert/alertActions";
import { login } from "@Actions/trader/accountActions";
import { Blocky } from "@Components/Blocky";
import { DarknodeList } from "@Components/DarknodeList";
import { ApplicationData } from "@Reducers/types";

interface LoggingInProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
}

interface LoggingInState {
}

/**
 * LoggingIn is a page whose principal components are wallet selection to allow users
 * to log-in, and the hidden orderbook
 */
class LoggingInClass extends React.Component<LoggingInProps, LoggingInState> {
    public constructor(props: LoggingInProps, context: object) {
        super(props, context);
        this.state = {
            checkingVerification: false,
        };
    }

    public render(): JSX.Element {

        const emptyCard = <div className="darknode-card">
            <div className="darknode-card--top" />
            <div className="darknode-card--middle">
                <Blocky address={"0x0000000000000000000000000000000000000000"} fgColor="#031830" spotColor="#031830" bgColor="#031830" />
            </div>
        </div>;

        return (
            <div className="logging-in">
                <Header hideOptions={true} />
                <div className="darknode-list background--darknode-list">
                    {emptyCard}
                    {emptyCard}
                    {emptyCard}
                    {emptyCard}
                </div>
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
