import * as React from "react";

import { Loading } from "@renproject/react-components";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { RegistrationStatus } from "../../lib/ethereum/network";
import { _captureInteractionException_ } from "../../lib/react/errors";
import {
    showDeregisterPopup, showRefundPopup, showRegisterPopup,
} from "../../store/account/operatorPopupActions";
import { ApplicationState, DarknodesState } from "../../store/applicationState";
import {
    updateDarknodeDetails, updateOperatorDarknodes,
} from "../../store/network/operatorActions";
import { AppDispatch } from "../../store/rootReducer";

export const statusText = {
    [RegistrationStatus.Unknown]: "Loading...",
    [RegistrationStatus.Unregistered]: "Deregistered",
    [RegistrationStatus.RegistrationPending]: "Registration pending",
    [RegistrationStatus.Registered]: "Registered",
    [RegistrationStatus.DeregistrationPending]: "Deregistration pending",
    [RegistrationStatus.Deregistered]: "Awaiting Refund Period",
    [RegistrationStatus.Refundable]: "Refundable",
};

const defaultState = { // Entries must be immutable
    active: false,
};

class RegistrationClass extends React.Component<Props, typeof defaultState> {
    private _isMounted = false;

    constructor(props: Props) {
        super(props);
        this.state = defaultState;
    }

    public componentDidMount = () => {
        this._isMounted = true;
    }

    public componentWillUnmount = () => {
        this._isMounted = false;
    }

    public componentWillReceiveProps = (nextProps: Props) => {
        if (this.props.registrationStatus !== nextProps.registrationStatus) {
            this.setState({ active: false });
        }
    }

    public render = (): JSX.Element => {
        const { isOperator, registrationStatus, publicKey } = this.props;
        const { address, tokenPrices } = this.props.store;
        const { active } = this.state;

        const disabled = active || !address;
        const registrationDisabled = disabled || !publicKey || !tokenPrices;

        const noStatus =
            (registrationStatus === RegistrationStatus.Unregistered) ||
            (isOperator && registrationStatus === RegistrationStatus.Refundable);

        const noOperator = (registrationStatus === RegistrationStatus.Unregistered) && this.props.darknodeDetails &&
            this.props.darknodeDetails.operator === "0x0000000000000000000000000000000000000000";

        return (
            <div className="status">
                {!noStatus ?
                    <span className="status--title">{statusText[this.props.registrationStatus]}</span> : null}
                {isOperator ? <>
                    {registrationStatus === RegistrationStatus.Unregistered ?
                        <button disabled={registrationDisabled} className="status--button" onClick={this.handleRegister}>
                            {active ? <>Registering <Loading className="status--button--spinner" alt={true} /></> : `Register darknode${registrationDisabled && !publicKey ? " (public key required)" : ""}`}
                        </button> :
                        null
                    }
                    {registrationStatus === RegistrationStatus.Registered ?
                        <button disabled={disabled} className="status--button" onClick={this.handleDeregister}>
                            {active ? <>Deregistering <Loading className="status--button--spinner" alt={true} /></> : "Deregister"}
                        </button> :
                        null
                    }
                    {registrationStatus === RegistrationStatus.Refundable
                        ? <button
                            disabled={disabled}
                            className="status--button status--button--focus"
                            onClick={this.handleRefund}
                        >
                            {active ? <>Refunding <Loading className="status--button--spinner" alt={true} /></> : "Refund"}
                        </button> :
                        null
                    }
                </> : noOperator ?
                        <span className="status--operator">NOT REGISTERED</span> :
                        (this.props.darknodeDetails ?
                            <span className="status--operator">
                                Operator: <span className="monospace">{this.props.darknodeDetails.operator}</span>
                            </span> :
                            null
                        )
                }
            </div>
        );
    }

    private readonly onCancel = () => {
        if (this._isMounted) {
            this.setState({ active: false });
        }
    }

    private readonly onDone = async () => {
        const { darknodeID } = this.props;
        const { web3, tokenPrices, renNetwork } = this.props.store;

        try {
            await this.props.actions.updateDarknodeDetails(web3, renNetwork, darknodeID, tokenPrices);
        } catch (error) {
            // Ignore error
        }

        if (this._isMounted) {
            this.setState({ active: false });
        }

    }

    private readonly onDoneRegister = async () => {
        const { web3, address, tokenPrices, darknodeList, renNetwork } = this.props.store;

        if (!address) {
            return; // FIXME
        }

        try {
            await this.props.actions.updateOperatorDarknodes(web3, renNetwork, address, tokenPrices, darknodeList);
        } catch (error) {
            // Ignore error
        }

        if (this._isMounted) {
            this.setState({ active: false });
        }
    }

    private readonly handleRegister = async (): Promise<void> => {
        const { darknodeID, publicKey } = this.props;
        const { web3, address, tokenPrices, renNetwork } = this.props.store;

        if (!publicKey || !address || !tokenPrices) {
            return; // FIXME
        }

        this.setState({ active: true });
        try {
            await this.props.actions.showRegisterPopup(
                web3, renNetwork, address, darknodeID, publicKey, tokenPrices, this.onCancel, this.onDoneRegister
            );
        } catch (error) {
            _captureInteractionException_(error, {
                description: "Error thrown from showRegisterPopup",
                shownToUser: "No",
            });
            this.onCancel();
        }
    }

    private readonly handleDeregister = async (): Promise<void> => {
        const { darknodeID, darknodeDetails } = this.props;
        const { web3, address, quoteCurrency, renNetwork } = this.props.store;

        if (!address) {
            return;
        }

        this.setState({ active: true });
        await this.props.actions.showDeregisterPopup(
            web3,
            renNetwork,
            address,
            darknodeID,
            darknodeDetails && darknodeDetails.feesEarnedTotalEth,
            quoteCurrency,
            this.onCancel,
            this.onDone);
    }

    private readonly handleRefund = async (): Promise<void> => {
        const { darknodeID } = this.props;
        const { web3, address, renNetwork } = this.props.store;

        if (!address) {
            return;
        }

        this.setState({ active: true });
        await this.props.actions.showRefundPopup(web3, renNetwork, address, darknodeID, this.onCancel, this.onDone);
    }
}

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.account.address,
        web3: state.account.web3,
        tokenPrices: state.network.tokenPrices,
        darknodeList: state.account.address ? state.network.darknodeList.get(state.account.address, null) : null,
        quoteCurrency: state.network.quoteCurrency,
        renNetwork: state.account.renNetwork,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        showRegisterPopup,
        showDeregisterPopup,
        showRefundPopup,
        updateDarknodeDetails,
        updateOperatorDarknodes,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    isOperator: boolean;
    registrationStatus: RegistrationStatus;
    darknodeID: string;
    darknodeDetails: DarknodesState | null;
    publicKey?: string;
}

export const Registration = connect(mapStateToProps, mapDispatchToProps)(RegistrationClass);
