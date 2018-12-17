import * as React from "react";

import { ApplicationData } from "@Reducers/types";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import contracts from "@Library/contracts/contracts";

import { approveNode, deregisterNode, refundNode, registerNode } from "@Actions/trader/darknode";
import { Token } from "@Library/tokens";
import BigNumber from "bignumber.js";

const BUTTON_PENDING = "Pending...";
const BUTTON_APPROVE = "Approve";
const BUTTON_REGISTER = "Register your darknode";
const BUTTON_DEREGISTER = "Deregister";
const BUTTON_REFUND = "Refund Bond";

interface RegistrationProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    operator: boolean;
    registrationStatus: string;
    network: string;
    darknodeID: string;
    publicKey?: string;
}

interface RegistrationState {
    buttonText: string;
    disabled: boolean;
    errorMessage: string;
    registerEnabled: boolean;
}

export enum RegistrationStatus {
    Unregistered = "unregistered",
    RegistrationPending = "registrationPending",
    Registered = "registered",
    DeregistrationPending = "deregistrationPending",
    AwaitingRefund = "awaitingRefund",
}

const statusText = {
    "unregistered": "Unregistered",
    "registrationPending": "Pending registration (waiting for epoch)",
    "registered": "Registered",
    "deregistrationPending": "Pending deregistration (waiting for epoch)",
    "awaitingRefund": "Awaiting refund",
};

class RegistrationClass extends React.Component<RegistrationProps, RegistrationState> {
    constructor(props: RegistrationProps) {
        super(props);
        this.state = {
            buttonText: "",
            disabled: true,
            errorMessage: "",
            registerEnabled: false, // This is used as an intermediary state for differentiating between approval and registration.
        };
    }

    public componentDidMount(): void {
        this.updateStatus(this.props, true).catch(console.error);
    }

    public componentWillReceiveProps(nextProps: RegistrationProps): void {
        const statusChanged = this.props.registrationStatus !== nextProps.registrationStatus;
        this.updateStatus(nextProps, statusChanged).catch(console.error);
    }

    public render(): JSX.Element {
        const { operator } = this.props;
        const { buttonText, disabled, errorMessage } = this.state;
        const buttonClass = buttonText === BUTTON_DEREGISTER ? "red" : "green";

        const showStatus = this.props.registrationStatus !== RegistrationStatus.Unregistered;

        return (
            <div className="status">
                {showStatus ? <span className="status--title">{statusText[this.props.registrationStatus]}</span> : null}
                {operator ? <>
                    <button className={`status--button ${buttonText ? `${buttonClass} hover` : ""}`} onClick={this.handleClick} disabled={disabled || !buttonText}>
                        <span>{buttonText || "Loading..."}</span>
                    </button>
                    {errorMessage &&
                        <span className="status--error">{errorMessage}</span>
                    }
                </> : null}
            </div>
        );
    }

    private updateStatus = async (props: RegistrationProps, statusChanged: boolean): Promise<void> => {
        let { buttonText, disabled } = this.state;
        const { sdk, minimumBond } = this.props.store;
        const ethAddress = await sdk.getWeb3().eth.getAccounts();
        if (!ethAddress[0]) {
            this.setState({ buttonText: "", disabled: true, errorMessage: "Please unlock your MetaMask wallet." });
            return;
        } else if (ethAddress[0] && this.state.errorMessage) {
            this.setState({ errorMessage: "" });
        }
        if (statusChanged || props.registrationStatus === "registrationPending" || props.registrationStatus === "deregistrationPending") {
            buttonText = BUTTON_PENDING;
            disabled = true;
        }
        if (props.registrationStatus === "unregistered") {
            // tslint:disable-next-line:no-non-null-assertion
            const renAddr = (await sdk._cachedTokenDetails.get(Token.REN))!.addr;
            const ercContract = new (sdk.getWeb3().eth.Contract)(contracts.ERC20.ABI, renAddr);
            const allowed = new BigNumber(await ercContract.methods.allowance(ethAddress[0], sdk._contracts.darknodeRegistry.address).call());
            if (minimumBond && allowed.lt(minimumBond) && (statusChanged || !buttonText)) {
                buttonText = BUTTON_APPROVE;
                disabled = false;
            } else if (minimumBond && allowed.gt(minimumBond) && (!this.state.registerEnabled || statusChanged || !buttonText)) {
                buttonText = BUTTON_REGISTER;
                disabled = false;
                this.setState({ registerEnabled: true });
            }
        } else if (props.registrationStatus === "registered" && (statusChanged || !buttonText)) {
            buttonText = BUTTON_DEREGISTER;
            disabled = false;
        } else if (props.registrationStatus === "awaitingRefund" && (statusChanged || !buttonText)) {
            buttonText = BUTTON_REFUND;
            disabled = false;
        }
        this.setState({ buttonText, disabled });
    }

    private handleClick = async (): Promise<void> => {
        const { darknodeID, publicKey } = this.props;
        const { sdk, minimumBond } = this.props.store;
        const { buttonText, disabled } = this.state;
        this.setState({ buttonText: BUTTON_PENDING, disabled: true, errorMessage: "" });

        try {
            switch (buttonText) {
                case BUTTON_APPROVE:
                    if (!minimumBond) {
                        throw new Error("Unable to retrieve minimum bond");
                    }
                    await this.props.actions.approveNode(sdk, minimumBond);
                    break;
                case BUTTON_REGISTER:
                    if (!publicKey) {
                        throw new Error("Invalid public key");
                    }
                    if (!minimumBond) {
                        throw new Error("Unable to retrieve minimum bond");
                    }
                    await this.props.actions.registerNode(sdk, darknodeID, publicKey, minimumBond);
                    break;
                case BUTTON_DEREGISTER:
                    await this.props.actions.deregisterNode(sdk, darknodeID);
                    break;
                case BUTTON_REFUND:
                    await this.props.actions.refundNode(sdk, darknodeID);
                    break;
            }
        } catch (error) {
            this.setState({ buttonText, disabled, errorMessage: error.message });
            return;
        }
    }
}


const mapStateToProps = (state: ApplicationData) => ({
    store: {
        sdk: state.trader.sdk,
        minimumBond: state.statistics.minimumBond,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        approveNode,
        registerNode,
        deregisterNode,
        refundNode,
    }, dispatch),
});

export const Registration = connect(mapStateToProps, mapDispatchToProps)(RegistrationClass);

