import * as React from "react";

import { ApplicationData } from "@Reducers/types";
import { BigNumber } from "bignumber.js";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { ERROR_TRANSACTION_FAILED, ERROR_UNLOCK_METAMASK } from "@Actions/trader/darknode";
import { Token } from "@Library/tokens";

interface TopupProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    darknodeAddress: string;
}

interface TopupState {
    value: string;
    weiAmount: string;
    resultMessage: string;
    pending: boolean;
    disabled: boolean;
}

const CONFIRMATION_MESSAGE = "Transaction confirmed, your balances will be updated shortly.";

class TopupClass extends React.Component<TopupProps, TopupState> {
    constructor(props: TopupProps) {
        super(props);
        this.state = {
            value: "0.1",
            weiAmount: "100000000000000000",
            resultMessage: "",
            pending: false,
            disabled: false
        };
    }

    public render(): JSX.Element {
        const { value, resultMessage, pending, disabled } = this.state;
        return (
            <div className="topup">
                <label>
                    <div className="topup--title">Amount</div>
                    <span className="topup--input">
                        <input type="number" value={value} min={0} onChange={this.handleChange} onBlur={this.handleBlur} />
                        <span>ETH</span>
                    </span>
                </label>
                {!pending ?
                    <button className="hover green" onClick={this.sendFunds} disabled={disabled}>
                        <span>Send</span>
                    </button>
                    :
                    <button disabled>Pending...</button>
                }
                {resultMessage &&
                    <p className={`${resultMessage === CONFIRMATION_MESSAGE ? "success" : "warning"}`}>{resultMessage}</p>
                }
            </div>
        );
    }

    private handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        this.setState({ value });

        // If input is invalid, show an error.
        if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
            this.setState({ resultMessage: "Please enter a valid amount.", disabled: true });
            return;
        } else if (this.state.resultMessage) {
            this.setState({ resultMessage: "", disabled: false });
        }
    }

    private handleBlur = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const { sdk } = this.props.store;
        // Convert input to Wei upon blur.
        const ethAmount = new BigNumber(e.target.value);
        // tslint:disable-next-line:no-non-null-assertion
        const tokenDetails = await sdk._cachedTokenDetails.get(Token.ETH);
        const ethMultiplier = new BigNumber(Math.pow(10, tokenDetails ? new BigNumber(tokenDetails.addr.toString()).toNumber() : 18));
        let weiAmount = ethAmount.times(ethMultiplier);
        weiAmount = weiAmount.decimalPlaces(0);
        const valueBN = weiAmount.dividedBy(ethMultiplier);
        this.setState({ weiAmount: weiAmount.toFixed(), value: valueBN.toFixed() });
    }

    private sendFunds = async (): Promise<void> => {
        const { sdk } = this.props.store;
        const ethAddress = await sdk.getWeb3().eth.getAccounts();
        if (!ethAddress[0]) {
            this.setState({ resultMessage: ERROR_UNLOCK_METAMASK, pending: false });
            return;
        } else if (ethAddress[0] && this.state.resultMessage) {
            this.setState({ resultMessage: "" });
        }

        this.setState({ pending: true });
        sdk.getWeb3().eth.sendTransaction({
            from: ethAddress[0],
            to: this.props.darknodeAddress,
            value: this.state.weiAmount,
        }).on("receipt", () => {
            this.setState({ value: "0", resultMessage: CONFIRMATION_MESSAGE, pending: false });
        }).on("error", () => {
            this.setState({ resultMessage: ERROR_TRANSACTION_FAILED, pending: false });
        });
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        sdk: state.trader.sdk,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

export const Topup = connect(mapStateToProps, mapDispatchToProps)(TopupClass);

