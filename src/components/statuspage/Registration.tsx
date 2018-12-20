import * as React from "react";

import { ApplicationData } from "@Reducers/types";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { RegistrationStatus, updateDarknodeStatistics, updateOperatorStatistics } from "@Actions/statistics/operatorActions";
import { showDeregisterPopup, showRefundPopup, showRegisterPopup } from "@Actions/statistics/operatorPopupActions";

interface RegistrationProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    operator: boolean;
    registrationStatus: RegistrationStatus;
    network: string;
    darknodeID: string;
    publicKey?: string;
}

interface RegistrationState {
    active: boolean;
}

export const statusText = {
    [RegistrationStatus.Unknown]: "Loading...",
    [RegistrationStatus.Unregistered]: "Deregistered",
    [RegistrationStatus.RegistrationPending]: "Registration pending",
    [RegistrationStatus.Registered]: "Registered",
    [RegistrationStatus.DeregistrationPending]: "Deregistration pending",
    [RegistrationStatus.Deregistered]: "Awaiting Refund Period",
    [RegistrationStatus.Refundable]: "Refundable",
};

class RegistrationClass extends React.Component<RegistrationProps, RegistrationState> {
    constructor(props: RegistrationProps) {
        super(props);
        this.state = {
            active: false,
        };
    }

    public componentWillReceiveProps = (nextProps: RegistrationProps) => {
        if (this.props.registrationStatus !== nextProps.registrationStatus) {
            this.setState({ active: false });
        }
    }

    public render(): JSX.Element {
        const { operator, registrationStatus, store: { address } } = this.props;
        const { active } = this.state;

        const disabled = active || !address;

        const noStatus =
            (registrationStatus === RegistrationStatus.Unregistered) ||
            (operator && registrationStatus === RegistrationStatus.Refundable);

        return (
            <div className="status">
                {!noStatus ?
                    <span className="status--title">{statusText[this.props.registrationStatus]}</span> : null}
                {operator ? <>
                    {registrationStatus === RegistrationStatus.Unregistered ?
                        <button disabled={disabled} className="status--button" onClick={this.handleRegister}>{active ? "Registering..." : "Register your darknode"}</button> : null}
                    {registrationStatus === RegistrationStatus.Registered ?
                        <button disabled={disabled} className="status--button" onClick={this.handleDeregister}>{active ? "Deregistering..." : "Deregister"}</button> : null}
                    {registrationStatus === RegistrationStatus.Refundable
                        ? <button disabled={disabled} className="status--button status--button--focus" onClick={this.handleRefund}>{active ? "Refunding..." : "Refund"}</button> : null}
                </> : null}
            </div>
        );
    }

    // private updateStatus = async (props: RegistrationProps): Promise<void> => {
    //     let { buttonText, disabled } = this.state;
    //     const { sdk, minimumBond } = this.props.store;

    //     // Reset state
    //     this.setState({  });

    //     // Show "Approve" or "Register" buttons
    //     if (props.registrationStatus === RegistrationStatus.Unregistered) {
    //         // tslint:disable-next-line:no-non-null-assertion
    //         const renAddr = (await sdk._cachedTokenDetails.get(Token.REN))!.addr;
    //         const ercContract = new (sdk.getWeb3().eth.Contract)(contracts.ERC20.ABI, renAddr);
    //         const allowed = new BigNumber(await ercContract.methods.allowance(sdk.getAddress(), sdk._contracts.darknodeRegistry.address).call());
    //         if (!minimumBond || allowed.lt(minimumBond)) {
    //             buttonText = BUTTON_APPROVE;
    //             disabled = false;
    //         } else if (allowed.gt(minimumBond) && (!this.state.registerEnabled)) {
    //             buttonText = BUTTON_REGISTER;
    //             disabled = false;
    //             this.setState({ registerEnabled: true });
    //         }
    //     }

    //     // Show "Deregister" button
    //     else if (props.registrationStatus === RegistrationStatus.Registered) {
    //         buttonText = BUTTON_DEREGISTER;
    //         disabled = false;
    //     }

    //     // Show "Refund" button
    //     else if (props.registrationStatus === RegistrationStatus.Refundable) {
    //         buttonText = BUTTON_REFUND;
    //         disabled = false;
    //     }
    //     this.setState({ buttonText, disabled });
    // }

    private onCancel = async () => {
        try {
            this.setState({ active: false });
        } catch (error) {
            // Ignore error
        }
    }

    private onDone = async () => {
        const { darknodeID } = this.props;
        const { sdk, tokenPrices } = this.props.store;

        try {
            await this.props.actions.updateDarknodeStatistics(sdk, darknodeID, tokenPrices);
            this.setState({ active: false });
        } catch (error) {
            // Ignore error
        }
    }

    private onDoneRegister = async () => {
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


    private handleRegister = async (): Promise<void> => {
        const { darknodeID, publicKey } = this.props;
        const { sdk, address, minimumBond, tokenPrices } = this.props.store;

        if (!publicKey || !address || !minimumBond || !tokenPrices) {
            return; // FIXME
        }

        this.setState({ active: true });
        this.props.actions.showRegisterPopup(
            sdk, address, darknodeID, publicKey, minimumBond, tokenPrices, this.onCancel, this.onDoneRegister
        );
    }


    private handleDeregister = async (): Promise<void> => {
        const { darknodeID } = this.props;
        const { sdk, address } = this.props.store;

        if (!address) {
            return;
        }

        this.setState({ active: true });
        await this.props.actions.showDeregisterPopup(sdk, address, darknodeID, this.onCancel, this.onDone);
    }

    private handleRefund = async (): Promise<void> => {
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

export const Registration = connect(mapStateToProps, mapDispatchToProps)(RegistrationClass);

