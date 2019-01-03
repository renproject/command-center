import * as qs from "query-string";
import * as React from "react";

import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";
import { bindActionCreators, Dispatch } from "redux";

import { Header } from "../../components/Header";
import { StatusPage } from "../../components/statuspage/StatusPage";

import { setAlert } from "../../actions/alert/alertActions";
import { RegistrationStatus } from "../../actions/statistics/operatorActions";
import { login } from "../../actions/trader/accountActions";
import { ApplicationData } from "../../reducers/types";

export enum DarknodeAction {
    View = "view",
    Register = "register",
    Deregister = "deregister",
}

interface DarknodeProps extends
    ReturnType<typeof mapStateToProps>,
    ReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
}

interface DarknodeState {
}

/**
 * Darknode shows the details of a darknode. The user does not have to be logged
 * in.
 *
 * URL parameters:
 *     1) action: either "register" or "deregister"
 *     2) public_key: only used if action is "register"
 */
class DarknodeClass extends React.Component<DarknodeProps, DarknodeState> {
    public constructor(props: DarknodeProps, context: object) {
        super(props, context);
        this.state = {
        };
    }

    public render(): JSX.Element {
        const { match: { params }, store } = this.props;
        const { sdk, darknodeDetails, darknodeNames, address } = store;
        // tslint:disable-next-line:no-any
        let { darknodeID } = params as { darknodeID: string | undefined, action: string | undefined };
        darknodeID = darknodeID && sdk.getWeb3().utils.toChecksumAddress(darknodeID.toLowerCase());

        const details = darknodeID ? darknodeDetails.get(darknodeID, null) : null;
        const name = darknodeID ? darknodeNames.get(darknodeID) : undefined;

        const readOnly = !details || !address || details.operator !== address;

        const queryParams = qs.parse(this.props.location.search);
        const action = typeof queryParams.action === "string" ? queryParams.action : undefined;
        const publicKey = typeof queryParams.public_key === "string" ? queryParams.public_key : undefined;

        let darknodeAction = DarknodeAction.View;
        if (
            (action === DarknodeAction.Register) &&
            (!details || details.registrationStatus === RegistrationStatus.Unregistered)
        ) {
            // If the URL action is Register, and the darknode has no details or is unregistered
            darknodeAction = action;
        } else if ((action === DarknodeAction.Deregister) &&
            details &&
            details.registrationStatus === RegistrationStatus.Registered
        ) {
            // If the URL action is Deregister, and the darknode is registered
            darknodeAction = action;
        }

        return (
            <div>
                <Header />
                <div className="container">
                    {darknodeID ?
                        <StatusPage
                            key={darknodeID}
                            action={darknodeAction}
                            publicKey={publicKey}
                            name={name}
                            darknodeID={darknodeID}
                            isOperator={!readOnly}
                            darknodeDetails={details}
                        /> :
                        <div>Darknode not found</div>
                    }
                </div>
            </div >
        );
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        darknodeDetails: state.statistics.darknodeDetails,
        darknodeNames: state.statistics.darknodeNames,
        darknodeList: state.trader.address ? state.statistics.darknodeList.get(state.trader.address, null) : null,
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
