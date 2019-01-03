import * as qs from "query-string";
import * as React from "react";

import Web3 from "web3";

import { connect } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";
import { bindActionCreators, Dispatch } from "redux";

import { Header } from "../../components/Header";
import { StatusPage } from "../../components/statuspage/StatusPage";

import { RegistrationStatus } from "../../actions/statistics/operatorActions";
import { EncodedData, Encodings } from "../../lib/general/encodedData";
import { ApplicationData } from "../../reducers/types";
import { NotFound } from "./NotFound";

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
        const { darknodeDetails, darknodeNames, address } = store;

        const darknodeID: string | undefined = getDarknodeParam(params);

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

        if (!darknodeID) {
            return <NotFound />;
        }

        return (
            <div>
                <Header />
                <div className="container">
                    <StatusPage
                        key={darknodeID}
                        action={darknodeAction}
                        publicKey={publicKey}
                        name={name}
                        darknodeID={darknodeID}
                        isOperator={!readOnly}
                        darknodeDetails={details}
                    />
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
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

export const Darknode = connect(mapStateToProps, mapDispatchToProps)(withRouter(DarknodeClass));

export const getDarknodeParam = (params: unknown): string | undefined => {
    const { darknodeID: darknodeID58 } = params as { darknodeID: string | undefined };
    let darknodeID;
    if (darknodeID58) {
        try {
            // Convert from base-58 to hex
            darknodeID = new EncodedData(darknodeID58, Encodings.BASE58)
                .toHex()
                .toLowerCase();

            // Convert to checksum address
            darknodeID = (new Web3()).utils.toChecksumAddress(darknodeID);
        } catch (err) {
            // If the darknode ID is malfomatted, ignore it
            darknodeID = undefined;
        }
    }
    return darknodeID;
};
