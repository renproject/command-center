import * as React from "react";

import { ApplicationData } from "@Reducers/types";
import { BigNumber } from "bignumber.js";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { ERROR_TRANSACTION_FAILED, fundNode } from "@Actions/trader/darknode";

interface TopupProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    darknodeAddress: string;
}

interface TopupState {
    value: string;
    resultMessage: string;
    pending: boolean;
    disabled: boolean;
    traderBalance: BigNumber;
}

const CONFIRMATION_MESSAGE = "Transaction confirmed, your balances will be updated shortly.";

class TopupClass extends React.Component<TopupProps, TopupState> {
    constructor(props: TopupProps) {
        super(props);
        this.state = {
            value: "0.1",
            resultMessage: "",
            pending: false,
            disabled: false,
            traderBalance: new BigNumber(0),
        };
    }

    public componentDidMount = async () => {
        this.updateTraderBalance().catch(console.error);
    }

    public render(): JSX.Element {
        const { value, resultMessage, pending, disabled } = this.state;
        return (
            <div className="topup">
                <label>
                    <div className="topup--title">Enter the amount of Ether you would like to deposit</div>
                    <span className="topup--input">
                        <input type="number" value={value} min={0} onChange={this.handleChange} onBlur={this.handleBlur} />
                        {!pending ?
                            <button className="hover green" onClick={this.sendFunds} disabled={disabled}>
                                <span>Deposit</span>
                            </button>
                            :
                            <button disabled>Depositing...</button>
                        }
                    </span>
                </label>
                {resultMessage &&
                    <p className={`${resultMessage === CONFIRMATION_MESSAGE ? "topup--input--success success" : "topup--input--warning warning"}`}>{resultMessage}</p>
                }
            </div>
        );
    }

    private handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        this.setState({ value });

        const { traderBalance, resultMessage, disabled } = this.state;
        // If input is invalid, show an error.
        if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
            this.setState({ disabled: true });
        } else if (traderBalance.isLessThan(value)) {
            this.setState({ resultMessage: `Insufficient balance. Maximum deposit: ${traderBalance.toFixed()}`, disabled: true });
        } else if (resultMessage || disabled) {
            this.setState({ resultMessage: "", disabled: false });
        }
    }

    private updateTraderBalance = async (): Promise<BigNumber> => {
        const { store: { sdk } } = this.props;
        const traderBalance = new BigNumber((await sdk.getWeb3().eth.getBalance(sdk.getAddress())).toString())
            .div(new BigNumber(10).exponentiatedBy(18));
        this.setState({ traderBalance });
        return traderBalance;
    }

    private handleBlur = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const { value } = this.state;
        let traderBalance;
        try {
            traderBalance = await this.updateTraderBalance();
            if (traderBalance.isLessThan(value)) {
                this.setState({ value: traderBalance.toFixed(), disabled: true });
            }
        } catch (err) {
            console.error(err);
        }
    }

    private sendFunds = async (): Promise<void> => {
        const { darknodeAddress, store: { sdk } } = this.props;
        const { value } = this.state;

        this.setState({ resultMessage: "", pending: true });


        try {
            await this.props.actions.fundNode(sdk, darknodeAddress, value);
            this.setState({ value: "0", resultMessage: CONFIRMATION_MESSAGE, pending: false });
        } catch (error) {
            console.error(error);
            this.setState({ resultMessage: ERROR_TRANSACTION_FAILED, pending: false });
        }
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        sdk: state.trader.sdk,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        fundNode,
    }, dispatch),
});

export const Topup = connect(mapStateToProps, mapDispatchToProps)(TopupClass);

