import * as React from "react";

import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import {
    RegistrationStatus,
    updateDarknodeStatistics,
    updateOperatorStatistics
} from "../../actions/statistics/operatorActions";
import { showDeregisterPopup, showRefundPopup, showRegisterPopup } from "../../actions/statistics/operatorPopupActions";
import { _captureInteractionException_ } from "../../lib/errors";
import { ApplicationData, DarknodeDetails } from "../../reducers/types";

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
    constructor(props: Props) {
        super(props);
        this.state = {
            active: false,
        };
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

        const disabled = active || !publicKey || !address || !minimumBond || !tokenPrices;

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
                        <button disabled={disabled} className="status--button" onClick={this.handleRegister}>
                            {active ? "Registering..." : `Register your darknode${disabled && !publicKey ? " (public key required)" : ""}`}
                        </button> :
                        null
                    }
                    {registrationStatus === RegistrationStatus.Registered ?
                        <button disabled={disabled} className="status--button" onClick={this.handleDeregister}>
                            {active ? "Deregistering..." : "Deregister"}
                        </button> :
                        null
                    }
                    {registrationStatus === RegistrationStatus.Refundable
                        ? <button
                            disabled={disabled}
                            className="status--button status--button--focus"
                            onClick={this.handleRefund}
                        >
                            {active ? "Refunding..." : "Refund"}
                        </button> :
                        null
                    }
                </> : noOperator ?
                        <span className="status--operator">DARKNODE NOT REGISTERED</span> :
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
        try {
            this.setState({ active: false });
        } catch (error) {
            // Ignore error
        }
    }

    private readonly onDone = async () => {
        const { darknodeID } = this.props;
        const { sdk, tokenPrices } = this.props.store;

        try {
            await this.props.actions.updateDarknodeStatistics(sdk, darknodeID, tokenPrices);
            this.setState({ active: false });
        } catch (error) {
            // Ignore error
        }
    }

    private readonly onDoneRegister = async () => {
        const { sdk, address, tokenPrices, darknodeList } = this.props.store;

        try {
            if (address) {
                await this.props.actions.updateOperatorStatistics(sdk, address, tokenPrices, darknodeList);
            }
            this.setState({ active: false });
        } catch (error) {
            // Ignore error
        }
    }

    private readonly handleRegister = async (): Promise<void> => {
        const { darknodeID, publicKey } = this.props;
        const { sdk, address, minimumBond, tokenPrices } = this.props.store;

        if (!publicKey || !address || !minimumBond || !tokenPrices) {
            return; // FIXME
        }

        this.setState({ active: true });
        try {
            await this.props.actions.showRegisterPopup(
                sdk, address, darknodeID, publicKey, minimumBond, tokenPrices, this.onCancel, this.onDoneRegister
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
        const { sdk, address, quoteCurrency } = this.props.store;

        if (!address) {
            return;
        }

        this.setState({ active: true });
        await this.props.actions.showDeregisterPopup(
            sdk,
            address,
            darknodeID,
            darknodeDetails && darknodeDetails.feesEarnedTotalEth,
            quoteCurrency,
            this.onCancel,
            this.onDone);
    }

    private readonly handleRefund = async (): Promise<void> => {
        const { darknodeID } = this.props;
        const { sdk, address } = this.props.store;

        if (!address) {
            return;
        }

        this.setState({ active: true });
        await this.props.actions.showRefundPopup(sdk, address, darknodeID, this.onCancel, this.onDone);
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        sdk: state.trader.sdk,
        minimumBond: state.statistics.minimumBond,
        tokenPrices: state.statistics.tokenPrices,
        darknodeList: state.trader.address ? state.statistics.darknodeList.get(state.trader.address, null) : null,
        quoteCurrency: state.statistics.quoteCurrency,
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
