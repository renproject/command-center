import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import { _captureInteractionException_ } from "../../lib/errors";
import {
    RegistrationStatus,
    updateDarknodeStatistics,
    updateOperatorStatistics
} from "../../store/actions/statistics/operatorActions";
import { showDeregisterPopup, showRefundPopup, showRegisterPopup } from "../../store/actions/statistics/operatorPopupActions";
import { ApplicationData, DarknodeDetails } from "../../store/types";
import { Loading } from "../Loading";

export const statusText = {
    [RegistrationStatus.Unknown]: "Loading...",
    [RegistrationStatus.Unregistered]: "Deregistered",
    [RegistrationStatus.RegistrationPending]: "Registration pending",
    [RegistrationStatus.Registered]: "Registered",
    [RegistrationStatus.DeregistrationPending]: "Deregistration pending",
    [RegistrationStatus.Deregistered]: "Awaiting Refund Period",
    [RegistrationStatus.Refundable]: "Refundable",
};

class RegistrationClass extends React.Component<Props, State> {
    private _isMounted = false;

    constructor(props: Props) {
        super(props);
        this.state = {
            active: false,
        };
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
        const { address, minimumBond, tokenPrices } = this.props.store;
        const { active } = this.state;

        const disabled = active || !address;
        const registrationDisabled = disabled || !publicKey || !minimumBond || !tokenPrices;

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
        const { web3, tokenPrices, ethNetwork } = this.props.store;

        try {
            await this.props.actions.updateDarknodeStatistics(web3, ethNetwork, darknodeID, tokenPrices);
        } catch (error) {
            // Ignore error
        }

        if (this._isMounted) {
            this.setState({ active: false });
        }

    }

    private readonly onDoneRegister = async () => {
        const { web3, address, tokenPrices, darknodeList, ethNetwork } = this.props.store;

        if (!address) {
            return; // FIXME
        }

        try {
            await this.props.actions.updateOperatorStatistics(web3, ethNetwork, address, tokenPrices, darknodeList);
        } catch (error) {
            // Ignore error
        }

        if (this._isMounted) {
            this.setState({ active: false });
        }
    }

    private readonly handleRegister = async (): Promise<void> => {
        const { darknodeID, publicKey } = this.props;
        const { web3, address, minimumBond, tokenPrices, ethNetwork } = this.props.store;

        if (!publicKey || !address || !minimumBond || !tokenPrices) {
            return; // FIXME
        }

        this.setState({ active: true });
        try {
            await this.props.actions.showRegisterPopup(
                web3, ethNetwork, address, darknodeID, publicKey, minimumBond, tokenPrices, this.onCancel, this.onDoneRegister
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
        const { web3, address, quoteCurrency, ethNetwork } = this.props.store;

        if (!address) {
            return;
        }

        this.setState({ active: true });
        await this.props.actions.showDeregisterPopup(
            web3,
            ethNetwork,
            address,
            darknodeID,
            darknodeDetails && darknodeDetails.feesEarnedTotalEth,
            quoteCurrency,
            this.onCancel,
            this.onDone);
    }

    private readonly handleRefund = async (): Promise<void> => {
        const { darknodeID } = this.props;
        const { web3, address, ethNetwork } = this.props.store;

        if (!address) {
            return;
        }

        this.setState({ active: true });
        await this.props.actions.showRefundPopup(web3, ethNetwork, address, darknodeID, this.onCancel, this.onDone);
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        web3: state.trader.web3,
        minimumBond: state.statistics.minimumBond,
        tokenPrices: state.statistics.tokenPrices,
        darknodeList: state.trader.address ? state.statistics.darknodeList.get(state.trader.address, null) : null,
        quoteCurrency: state.statistics.quoteCurrency,
        ethNetwork: state.trader.ethNetwork,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        showRegisterPopup,
        showDeregisterPopup,
        showRefundPopup,
        updateDarknodeStatistics,
        updateOperatorStatistics,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    isOperator: boolean;
    registrationStatus: RegistrationStatus;
    darknodeID: string;
    darknodeDetails: DarknodeDetails | null;
    publicKey?: string;
}

interface State {
    active: boolean;
}

export const Registration = connect(mapStateToProps, mapDispatchToProps)(RegistrationClass);
