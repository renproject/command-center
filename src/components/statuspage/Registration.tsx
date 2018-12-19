import * as React from "react";

import { ApplicationData } from "@Reducers/types";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { setPopup } from "@Actions/popup/popupActions";
import { RegistrationStatus } from "@Actions/statistics/operatorActions";
import { deregisterNode, refundNode } from "@Actions/trader/darknode";
import { Loading } from "@Components/Loading";
import { RegisterPopup } from "@Components/popups/RegisterPopup";

interface RegistrationProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    operator: boolean;
    registrationStatus: RegistrationStatus;
    network: string;
    darknodeID: string;
    publicKey?: string;
}

interface RegistrationState {
    disabled: boolean;
}

export const statusText = {
    [RegistrationStatus.Unknown]: "Loading...",
    [RegistrationStatus.Unregistered]: "Unregistered",
    [RegistrationStatus.RegistrationPending]: "Registration pending",
    [RegistrationStatus.Registered]: "Registered",
    [RegistrationStatus.DeregistrationPending]: "Deregistration pending",
    [RegistrationStatus.AwaitingRefund]: "Awaiting refund",
};

class RegistrationClass extends React.Component<RegistrationProps, RegistrationState> {
    constructor(props: RegistrationProps) {
        super(props);
        this.state = {
            disabled: false,
        };
    }

    public render(): JSX.Element {
        const { operator, registrationStatus, store: { address } } = this.props;
        let { disabled } = this.state;

        disabled = disabled || !address;

        return (
            <div className="status">
                {registrationStatus !== RegistrationStatus.Unregistered ?
                    <span className="status--title">{statusText[this.props.registrationStatus]}</span> : null}
                {operator ? <>
                    {registrationStatus === RegistrationStatus.Unregistered ?
                        <button disabled={disabled} className="status--button green hover" onClick={this.handleRegister}>Register your darknode{disabled ? <Loading alt={true} /> : null}</button> : null}
                    {registrationStatus === RegistrationStatus.Registered ?
                        <button disabled={disabled} className="status--button red hover" onClick={this.handleDeregister}>Deregister{disabled ? <Loading alt={true} /> : null}</button> : null}
                    {registrationStatus === RegistrationStatus.AwaitingRefund
                        ? <button disabled={disabled} className="status--button green hover" onClick={this.handleRefund}>Refund{disabled ? <Loading alt={true} /> : null}</button> : null}
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
    //     else if (props.registrationStatus === RegistrationStatus.AwaitingRefund) {
    //         buttonText = BUTTON_REFUND;
    //         disabled = false;
    //     }
    //     this.setState({ buttonText, disabled });
    // }


    private handleRegister = async (): Promise<void> => {
        const { darknodeID, publicKey } = this.props;

        if (!publicKey) {
            return; // FIXME
        }

        this.setState({ disabled: true });
        const onCancel = () => {
            this.setState({ disabled: false });
        };

        this.props.actions.setPopup(
            { popup: <RegisterPopup darknodeID={darknodeID} publicKey={publicKey} onCancel={onCancel} />, onCancel, dismissible: false, overlay: true }
        );
    }


    private handleDeregister = async (): Promise<void> => {
        const { darknodeID } = this.props;
        const { sdk, address } = this.props.store;

        if (!address) {
            return;
        }

        // this.setState({ disabled: true, });
        await this.props.actions.deregisterNode(sdk, address, darknodeID);
    }

    private handleRefund = async (): Promise<void> => {
        const { darknodeID } = this.props;
        const { sdk, address } = this.props.store;

        if (!address) {
            return;
        }

        // this.setState({ disabled: true, });
        await this.props.actions.refundNode(sdk, address, darknodeID);
    }
}


const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        sdk: state.trader.sdk,
        minimumBond: state.statistics.minimumBond,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        setPopup,
        refundNode,
        deregisterNode,
    }, dispatch),
});

export const Registration = connect(mapStateToProps, mapDispatchToProps)(RegistrationClass);

