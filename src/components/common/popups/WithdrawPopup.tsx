import * as React from "react";

import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loading, TokenIcon } from "@renproject/react-components";
import { TxStatus } from "@renproject/ren";
import { List } from "immutable";
import { connect, ConnectedReturnType } from "react-redux";
import { bindActionCreators } from "redux";

import { AllTokenDetails, Token } from "../../../lib/ethereum/tokens";
import { className } from "../../../lib/react/className";
import { ApplicationState } from "../../../store/applicationState";
import {
    addToWithdrawAddresses, removeFromWithdrawAddresses,
} from "../../../store/network/operatorActions";
import { AppDispatch } from "../../../store/rootReducer";

enum Stage {
    Pending,
    Withdrawing,
    Done,
    Error,
}

const defaultState = { // Entries must be immutable
    error: null as string | null,
    stage: Stage.Pending,
    selectedAddress: null as string | null,
    newAddress: null as string | null,
    newAddressValid: false,
};

const renderTxStatus = (status: TxStatus | null) => {
    switch (status) {
        case null:
            return "Submitting";
        case TxStatus.TxStatusNil:
            return "Submitting";
        case TxStatus.TxStatusConfirming:
            return "Waiting for confirmations";
        case TxStatus.TxStatusPending:
            return "Executing";
        case TxStatus.TxStatusExecuting:
            return "Executing";
        case TxStatus.TxStatusDone:
            return "Done";
        case TxStatus.TxStatusReverted:
            return "Reverted";
    }
};

class WithdrawPopupClass extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = defaultState;
    }

    // public componentDidMount = async (): Promise<void> => {
    // }

    public render = (): JSX.Element => {
        const { stage, selectedAddress, newAddress, newAddressValid } = this.state;
        const { status, store: { withdrawAddresses }, token } = this.props;

        return <div className="popup withdraw">
            <h2>Select <TokenIcon token={token} /> {token} withdraw address</h2>
            {stage === Stage.Pending || stage === Stage.Error ?
                <>
                    <div className="withdraw--addresses">
                        {withdrawAddresses.get(token, List<string>()).map((withdrawAddress: string) => {
                            return <div key={withdrawAddress} className={className("withdraw--address--outer", selectedAddress === withdrawAddress ? `withdraw--selected` : "")}>
                                <button
                                    name="selectedAddress"
                                    onClick={this.handleInput}
                                    value={withdrawAddress}
                                    className={`monospace withdraw--address`}
                                >
                                    {withdrawAddress}
                                </button>
                                <button value={withdrawAddress} onClick={this.removeAddress} className="withdraw--address--remove">
                                    <FontAwesomeIcon icon={faTimes} pull="right" />
                                </button>
                            </div>;
                        }).toArray()}
                    </div>
                    <form onSubmit={this.addNewAddress}>
                        <div className={`new-address--outer ${newAddressValid ? "input--valid" : ""}`}>
                            <input
                                type="text"
                                placeholder="New address"
                                value={newAddress || ""}
                                name="newAddress"
                                className="new-address"
                                onChange={this.handleAddressInput}
                            />
                            <button type="submit" title={newAddressValid ? "Add address" : `Invalid ${token} address`} disabled={!newAddressValid} className={["new-address--plus", newAddressValid ? "new-address--plus--green" : "new-address--plus--red"].join(" ")}>
                                <FontAwesomeIcon icon={faPlus} pull="right" />
                            </button>
                        </div>
                    </form>
                </> : <>
                    {status === TxStatus.TxStatusConfirming || status === TxStatus.TxStatusExecuting || status === TxStatus.TxStatusPending || status === TxStatus.TxStatusDone ? <>
                        The withdrawal has been submitted to RenVM. Your funds will be available shortly.<br />
                        Status: {renderTxStatus(status)}
                    </> : <></>}
                </>}
            {this.renderButtons()}
        </div>;
    }

    private readonly addNewAddress = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (this.state.newAddress) {
            this.props.actions.addToWithdrawAddresses({ token: this.props.token, address: this.state.newAddress });
            this.setState({ selectedAddress: this.state.newAddress, newAddress: null, newAddressValid: false });
        }
    }

    private readonly removeAddress = (event: React.FormEvent<HTMLButtonElement>): void => {
        const element = (event.currentTarget as HTMLButtonElement);
        if (this.state.selectedAddress === element.value) {
            this.setState({ selectedAddress: null });
        }
        this.props.actions.removeFromWithdrawAddresses({ token: this.props.token, address: element.value });
    }

    private readonly handleInput = (event: React.FormEvent<HTMLInputElement | HTMLButtonElement>): string => {
        const element = (event.target as (HTMLInputElement | HTMLButtonElement));
        this.setState((current: State) => ({ ...current, selectedAddress: null, [element.name]: element.value, }));
        return element.value;
    }

    private readonly handleAddressInput = (event: React.FormEvent<HTMLInputElement | HTMLButtonElement>) => {
        const address = this.handleInput(event);
        const tokenDetails = AllTokenDetails.get(this.props.token);
        if (!tokenDetails) {
            return;
        }
        const newAddressValid = tokenDetails.validator(address, this.props.store.renNetwork.networkID !== 1);
        this.setState({ newAddressValid });
    }

    private readonly renderButtons = () => {
        const { stage, error, selectedAddress } = this.state;
        const { onCancel } = this.props;

        // eslint-disable-next-line
        switch (stage) {
            case Stage.Pending:
                return <div className="popup--buttons">
                    <button className="sign--button button--white" onClick={onCancel}>Cancel</button>
                    <button className="sign--button button" disabled={selectedAddress === null} onClick={this.callWithdraw}>Submit</button>
                </div>;
            case Stage.Withdrawing:
                return <div className="popup--buttons">
                    <Loading />
                </div>;
            case Stage.Done:
                return <div className="popup--buttons">
                    <button className="sign--button button" onClick={this.onDone}>Close</button>
                </div>;
            case Stage.Error:
                return <>
                    {error ? <p className="red popup--error">{error}</p> : null}
                    <div className="popup--buttons">
                        <button className="sign--button button--white" onClick={onCancel}>Cancel</button>
                        <button className="sign--button button--white" disabled={selectedAddress === null} onClick={this.callWithdraw}>Retry</button>
                    </div>
                </>;
        }
    }

    private readonly onDone = () => {
        this.props.onDone();
    }

    private readonly callWithdraw = async () => {
        const { withdraw } = this.props;
        const { selectedAddress } = this.state;

        if (!selectedAddress) {
            this.setState({ error: "No address selected. " });
            return;
        }

        this.setState({ stage: Stage.Withdrawing, error: null });

        try {
            await withdraw(selectedAddress);
            this.setState({ stage: Stage.Done });
        } catch (error) {
            this.setState({ stage: Stage.Error, error: error.message || error });
        }
    }
}

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        renNetwork: state.account.renNetwork,
        withdrawAddresses: state.network.withdrawAddresses,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        addToWithdrawAddresses,
        removeFromWithdrawAddresses,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    token: Token;
    status: TxStatus;
    withdraw(address: string): Promise<void>;
    onDone(): void;
    onCancel(): void;
}

type State = typeof defaultState;

export const WithdrawPopup = connect(mapStateToProps, mapDispatchToProps)(WithdrawPopupClass);
