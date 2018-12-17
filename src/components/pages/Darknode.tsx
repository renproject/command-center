import * as qs from "query-string";
import * as React from "react";

import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";
import { bindActionCreators, Dispatch } from "redux";

import { Header } from "@Components/Header";
import { StatusPage } from "@Components/statuspage/StatusPage";

import { setAlert } from "@Actions/alert/alertActions";
import { login } from "@Actions/trader/accountActions";
import { ApplicationData } from "@Reducers/types";

export enum DarknodeAction {
    View,
    Register,
    Deregister
}

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
        const { sdk, darknodeDetails, address } = store;
        // tslint:disable-next-line:no-any
        const { darknodeID } = params as { darknodeID: string | undefined, action: string | undefined };
        const details = darknodeID ? darknodeDetails.get(darknodeID, null) : null;
        const readOnly = !details || !address || details.operator !== address;

        const queryParams = qs.parse(this.props.location.search);
        const action = typeof queryParams.action === "string" ? queryParams.action : undefined;
        const publicKey = typeof queryParams.public_key === "string" ? queryParams.public_key : undefined;

        let darknodeAction;
        switch (action) {
            case "register":
                darknodeAction = DarknodeAction.Register; break;
            case "deregister":
                darknodeAction = DarknodeAction.Deregister; break;
            default:
                darknodeAction = DarknodeAction.View;
        }

        if (!address) {
            darknodeAction = DarknodeAction.View;
        }

        return (
            <div>
                <Header />
                <div className="container">
                    {darknodeID ?
                        <StatusPage action={darknodeAction} publicKey={publicKey} darknodeID={darknodeID} operator={!readOnly} darknodeDetails={details} /> :
                        <div>Darknode not found</div>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
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
