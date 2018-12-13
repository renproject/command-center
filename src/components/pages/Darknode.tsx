import * as React from "react";

import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";
import { bindActionCreators, Dispatch } from "redux";

import { Header } from "@Components/Header";
import { Sidebar } from "@Components/Sidebar";
import { StatusPage } from "@Components/statuspage/StatusPage";

import { setAlert } from "@Actions/alert/alertActions";
import { login } from "@Actions/trader/accountActions";
import { ApplicationData } from "@Reducers/types";

interface DarknodeProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps>, RouteComponentProps {
}

interface DarknodeState {
}

/**
 * Darknode is a page whose principal components are wallet selection to allow users
 * to log-in, and the hidden orderbook
 */
class DarknodeClass extends React.Component<DarknodeProps, DarknodeState> {
    public constructor(props: DarknodeProps, context: object) {
        super(props, context);
        this.state = {
        };
    }

    public render(): JSX.Element {
        const { match: { params }, store } = this.props;
        const { sdk, darknodeDetails, darknodeList, } = store;
        // tslint:disable-next-line:no-any
        const { darknodeID } = params as { darknodeID: string };
        const details = darknodeID ? darknodeDetails.get(darknodeID, null) : null;

        return (
            <div>
                <Header />
                {sdk ?
                    <>
                        <Sidebar selectedDarknode={darknodeID} />
                        <div className="container">
                            {darknodeID ?
                                <StatusPage sdk={sdk} darknodeID={darknodeID} darknodeDetails={details} /> :
                                <div>Darknode not found</div>
                            }
                        </div>
                    </> :
                    <></>
                }
            </div>
        );
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        darknodeDetails: state.statistics.darknodeDetails,
        darknodeList: state.statistics.darknodeList,
        sdk: state.trader.sdk,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        login,
        setAlert,
    }, dispatch),
});

export const Darknode = connect(mapStateToProps, mapDispatchToProps)(withRouter(DarknodeClass));
