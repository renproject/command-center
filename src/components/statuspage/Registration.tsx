import * as React from "react";

import Web3 from "web3";

import RenExSDK from "@renex/renex";
import contracts from "./lib/contracts";
import { Token } from "./lib/tokens";

export const ERROR_UNLOCK_METAMASK = "Please unlock your MetaMask wallet.";
export const ERROR_TRANSACTION_FAILED = "Transaction failed, please try again.";

const BUTTON_PENDING = "Pending...";
const BUTTON_APPROVE = "Approve";
const BUTTON_REGISTER = "Register";
const BUTTON_DEREGISTER = "Deregister";
const BUTTON_REFUND = "Refund Bond";

interface RegistrationProps {
    operator: boolean;
    sdk: RenExSDK;
    minBond: number;
    registrationStatus: string;
    network: string;
    darknodeAddress: string;
    publicKey: string;
}

interface RegistrationState {
    buttonText: string;
    disabled: boolean;
    errorMessage: string;
    registerEnabled: boolean;
}

const RegistrationStatus = {
    "unregistered": "Unregistered",
    "registrationPending": "Pending registration (waiting for epoch)",
    "registered": "Registered",
    "deregistrationPending": "Pending deregistration (waiting for epoch)",
    "awaitingRefund": "Awaiting refund",
};

export class Registration extends React.Component<RegistrationProps, RegistrationState> {
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
        return (
            <div className="status">
                <span className="status--title">{RegistrationStatus[this.props.registrationStatus]}</span>
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
        const { minBond, sdk } = this.props;
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
            const allowed = await ercContract.methods.allowance(ethAddress[0], props.sdk._contracts.darknodeRegistry.address).call();
            if (allowed < minBond && (statusChanged || !buttonText)) {
                buttonText = BUTTON_APPROVE;
                disabled = false;
            } else if (allowed >= minBond && (!this.state.registerEnabled || statusChanged || !buttonText)) {
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
        const { buttonText, disabled } = this.state;
        this.setState({ buttonText: BUTTON_PENDING, disabled: true, errorMessage: "" });

        let error;
        switch (buttonText) {
            case BUTTON_APPROVE:
                error = await this.approveNode();
                break;
            case BUTTON_REGISTER:
                error = await this.registerNode();
                break;
            case BUTTON_DEREGISTER:
                error = await this.deregisterNode();
                break;
            case BUTTON_REFUND:
                error = await this.refundNode();
                break;
        }
        if (error) {
            this.setState({ buttonText, disabled, errorMessage: error.message });
            return;
        }
    }

    private approveNode = async (): Promise<Error | null> => {
        const { minBond, sdk } = this.props;
        const ethAddress = await sdk.getWeb3().eth.getAccounts();
        if (!ethAddress[0]) {
            return new Error(ERROR_UNLOCK_METAMASK);
        }

        // tslint:disable-next-line:no-non-null-assertion
        const renAddr = (await sdk._cachedTokenDetails.get(Token.REN))!.addr;
        const ercContract = new (sdk.getWeb3().eth.Contract)(contracts.ERC20.ABI, renAddr);
        const ercBalance = await ercContract.methods.balanceOf(ethAddress[0]).call();
        if (ercBalance < minBond) {
            return new Error("You do not have sufficient REN to register this node.");
        }
        try {
            await ercContract.methods.approve(sdk._contracts.darknodeRegistry.address, this.props.minBond).send({ from: ethAddress[0] });
        } catch (error) {
            return new Error(ERROR_TRANSACTION_FAILED);
        }
        return null;
    }

    private registerNode = async (): Promise<Error | null> => {
        const { minBond, darknodeAddress, publicKey, sdk } = this.props;
        const ethAddress = await sdk.getWeb3().eth.getAccounts();
        if (!ethAddress[0]) {
            return new Error(ERROR_UNLOCK_METAMASK);
        }

        try {
            await sdk._contracts.darknodeRegistry.register(darknodeAddress, publicKey, minBond.toString(), { from: ethAddress[0] });
        } catch (error) {
            return new Error(ERROR_TRANSACTION_FAILED);
        }
        return null;
    }

    private deregisterNode = async (): Promise<Error | null> => {
        const { sdk } = this.props;
        if (this.props.registrationStatus !== "registered") {
            return new Error("Only registered nodes can be deregistered.");
        }
        // The node has been registered and can be deregistered.
        const ethAddress = await sdk.getWeb3().eth.getAccounts();
        if (!ethAddress[0]) {
            return new Error(ERROR_UNLOCK_METAMASK);
        }
        const owner = await this.props.sdk._contracts.darknodeRegistry.getDarknodeOwner(this.props.darknodeAddress);
        if (owner !== ethAddress[0]) {
            return new Error("Only the owner can deregister this node.");
        }
        try {
            await this.props.sdk._contracts.darknodeRegistry.deregister(this.props.darknodeAddress, { from: ethAddress[0] });
        } catch (error) {
            return new Error(ERROR_TRANSACTION_FAILED);
        }
        return null;
    }

    private refundNode = async (): Promise<Error | null> => {
        const { sdk } = this.props;
        if (this.props.registrationStatus !== "awaitingRefund") {
            return new Error("The bond for this node cannot be refunded at this stage.");
        }
        // The node is awaiting refund.
        const ethAddress = await sdk.getWeb3().eth.getAccounts();
        if (!ethAddress[0]) {
            return new Error(ERROR_UNLOCK_METAMASK);
        }
        const owner = await this.props.sdk._contracts.darknodeRegistry.getDarknodeOwner(this.props.darknodeAddress);
        if (owner !== ethAddress[0]) {
            return new Error("Only the owner can refund the bond for this node.");
        }
        try {
            await this.props.sdk._contracts.darknodeRegistry.refund(this.props.darknodeAddress, { from: ethAddress[0] });
        } catch (error) {
            return new Error(ERROR_TRANSACTION_FAILED);
        }
        return null;
    }
}
