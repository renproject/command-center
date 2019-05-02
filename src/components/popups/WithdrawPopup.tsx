import * as React from "react";

import { List } from "immutable";
import { connect, ConnectedReturnType } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { Token } from "../../lib/ethereum/tokens";
import { addToWithdrawAddresses } from "../../store/actions/statistics/operatorActions";
import { ApplicationData } from "../../store/types";
import { Loading } from "../Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

enum Stage {
    Pending,
    Withdrawing,
    Done,
    Error,
}

class WithdrawPopupClass extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            error: null,
            stage: Stage.Pending,
            selectedAddress: null,
            newAddress: null,
        };
    }

    // public componentDidMount = async (): Promise<void> => {
    // }

    public render = (): JSX.Element => {
        const { selectedAddress, newAddress } = this.state;
        const { store: { withdrawAddresses }, token } = this.props;

        return <div className="popup withdraw">
            <h2>Select withdraw address</h2>
            <div className="withdraw--addresses">
                {withdrawAddresses.get(token, List<string>()).map((withdrawAddress: string) => {
                    return <button
                        role="button"
                        name="withdrawAddress"
                        onClick={this.selectAddress}
                        key={withdrawAddress}
                        className={`monospace withdraw--address ${selectedAddress === withdrawAddress ? `withdraw--selected` : ""}`}
                    >
                        {withdrawAddress}
                        <button onClick={this.removeAddress}>
                            <FontAwesomeIcon icon={faTimes} pull="right" className="withdraw--address--remove" />
                        </button>
                    </button>;
                }).toArray()}
            </div>
            <form onSubmit={this.addNewAddress}>
                <input
                    type="text"
                    placeholder="New address"
                    value={newAddress || ""}
                    role="textbox"
                    name="newAddress"
                    className="newAddress"
                    onChange={this.handleInput}
                />
            </form>
            {this.renderButtons()}
        </div>;
    }

    private readonly addNewAddress = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (this.state.newAddress) {
            this.props.actions.addToWithdrawAddresses({ token: this.props.token, address: this.state.newAddress });
        }
    }

    private readonly removeAddress = (event: React.FormEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        const element = (event.target as HTMLButtonElement);
        // this.setState({ selectedAddress: element.name });
    };

    private readonly selectAddress = (event: React.FormEvent<HTMLButtonElement>): void => {
        const element = (event.target as HTMLButtonElement);
        console.log(element.name);
        this.setState({ selectedAddress: element.name });
    };

    private readonly handleInput = (event: React.FormEvent<HTMLInputElement>): void => {
        const element = (event.target as HTMLInputElement);
        this.setState((current: State) => ({ ...current, selectedAddress: null, [element.name]: element.value, }));
    }

    private readonly renderButtons = () => {
        const { stage, error, selectedAddress } = this.state;
        const { onCancel } = this.props;

        switch (stage) {
            case Stage.Pending:
                return <>
                    <button className="sign--button" onClick={onCancel}>Cancel</button>
                    <button className="sign--button" disabled={selectedAddress === null} onClick={this.callWithdraw}>Submit</button>
                </>;
            case Stage.Withdrawing:
                return <>
                    <Loading />
                </>;
            case Stage.Done:
                return <>
                    <button className="sign--button" onClick={this.onDone}>Close</button>
                </>;
            case Stage.Error:
                return <>
                    {error ? <p className="red">{error}</p> : null}
                    <button className="sign--button" onClick={onCancel}>Submit</button>
                    <button className="sign--button" disabled={selectedAddress === null} onClick={this.callWithdraw}>Retry</button>
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
        } catch (error) {
            this.setState({ stage: Stage.Error, error: error.message || error });
            return;
        }
        this.setState({ stage: Stage.Done });
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        withdrawAddresses: state.statistics.withdrawAddresses,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        addToWithdrawAddresses
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    token: Token;
    withdraw(address: string): Promise<void>;
    onDone(): void;
    onCancel(): void;
}

interface State {
    error: string | null;
    stage: Stage;
    selectedAddress: null | string;
    newAddress: string | null;
}

export const WithdrawPopup = connect(mapStateToProps, mapDispatchToProps)(WithdrawPopupClass);
