import * as qs from "query-string";
import * as React from "react";

import Web3 from "web3";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { RouteComponentProps, withRouter } from "react-router";
import { bindActionCreators, Dispatch } from "redux";

import { StatusPage } from "../statuspage/StatusPage";

import { EncodedData, Encodings } from "../../lib/encodedData";
import { addRegisteringDarknode, RegistrationStatus, setDarknodeName } from "../../store/actions/statistics/operatorActions";
import { ApplicationData } from "../../store/types";
import { _catch_ } from "../ErrorBoundary";
import { NotFound } from "./NotFound";

export enum DarknodeAction {
    View = "view",
    Register = "register",
    Deregister = "deregister",
}

const darknodeIDBase58ToHex = (darknodeID: string): string =>
    (new Web3()).utils.toChecksumAddress(
        (`0x${new EncodedData(darknodeID, Encodings.BASE58).toHex("").slice(4)}`).toLowerCase()
    );

export const darknodeIDHexToBase58 = (darknodeID: string): string =>
    new EncodedData(`0x1B14${darknodeID.slice(2)}`, Encodings.HEX).toBase58();

export const getDarknodeParam = (params: unknown): string | undefined => {
    const { darknodeID: darknodeID58 } = params as { darknodeID: string | undefined };
    let darknodeID;
    if (darknodeID58) {
        try {
            // Convert from base-58 to hex
            darknodeID = darknodeIDBase58ToHex(darknodeID58);
        } catch (error) {
            // If the darknode ID is malformatted, ignore it
            console.error(error);
            darknodeID = undefined;
        }
    }
    return darknodeID;
};

/**
 * Darknode shows the details of a darknode. The user does not have to be logged
 * in.
 *
 * URL parameters:
 *     1) action: either "register" or "deregister"
 *     2) public_key: only used if action is "register"
 */
class DarknodeClass extends React.Component<Props, State> {
    public constructor(props: Props, context: object) {
        super(props, context);
        this.state = {
            darknodeID: undefined,
            action: undefined,
            publicKey: undefined,
            providedName: undefined,
        };
    }

    public componentDidMount = (): void => {
        this.handleNewProps(this.props, true);
    }

    public componentWillReceiveProps = (nextProps: Props): void => {
        this.handleNewProps(nextProps, false);
    }

    public render = (): JSX.Element => {
        const { store } = this.props;
        const { darknodeDetails, darknodeNames, address } = store;

        const { darknodeID, action, publicKey } = this.state;

        const details = darknodeID ? darknodeDetails.get(darknodeID, null) : null;
        const name = darknodeID ? darknodeNames.get(darknodeID) : undefined;

        const readOnly = !details || !address || details.operator !== address;

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
                {/* <Header /> */}
                <div className="container">
                    {_catch_(<StatusPage
                        key={darknodeID}
                        action={darknodeAction}
                        publicKey={publicKey}
                        name={name}
                        darknodeID={darknodeID}
                        isOperator={!readOnly}
                        darknodeDetails={details}
                    />)}
                </div>
            </div >
        );
    }

    private readonly handleNewProps = (nextProps: Props, firstTime: boolean): void => {
        const { location: { search } } = this.props;
        const { match: { params: nextParams }, location: { search: nextSearch } } = nextProps;

        const darknodeID: string | undefined = getDarknodeParam(nextParams);
        this.setState({ darknodeID });

        if (firstTime || search !== nextSearch) {
            const queryParams = qs.parse(nextSearch);
            const action = typeof queryParams.action === "string" ? queryParams.action : undefined;
            const publicKey = typeof queryParams.public_key === "string" ? queryParams.public_key : undefined;
            const name = typeof queryParams.name === "string" ? queryParams.name : undefined;

            if (darknodeID && action === DarknodeAction.Register && name !== undefined) {
                this.props.actions.setDarknodeName({ darknodeID, name });
            }

            if (darknodeID && action === DarknodeAction.Register && firstTime && publicKey) {
                this.props.actions.addRegisteringDarknode({ darknodeID, publicKey });
            }

            this.setState({ action, publicKey, providedName: name });
        }
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
        setDarknodeName,
        addRegisteringDarknode,
    }, dispatch),
});

interface Props extends
    ReturnType<typeof mapStateToProps>,
    ConnectedReturnType<typeof mapDispatchToProps>,
    RouteComponentProps {
}

interface State {
    darknodeID: string | undefined;
    action: string | undefined;
    publicKey: string | undefined;
    providedName: string | undefined;
}

export const Darknode = connect(mapStateToProps, mapDispatchToProps)(withRouter(DarknodeClass));
