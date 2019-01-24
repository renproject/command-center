import * as React from "react";

import { BigNumber } from "bignumber.js";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import { updateDarknodeStatistics } from "../../actions/statistics/operatorActions";
import { showFundPopup } from "../../actions/statistics/operatorPopupActions";
import { _captureBackgroundException_ } from "../../lib/errors";
import { ApplicationData } from "../../reducers/types";

const CONFIRMATION_MESSAGE = "Transaction confirmed.";

class TopUpClass extends React.Component<Props, State> {
    constructor(props: Props) {
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
        this.updateTraderBalance().catch((error) => {
            _captureBackgroundException_(error, {
                description: "Error in updateTraderBalance in TopUp",
            });
        });
    }

    public render = (): JSX.Element => {
        const { value, resultMessage, pending, disabled } = this.state;
        return (
            <div className="topup">
                <label>
                    <div className="topup--title">Enter the amount of Ether you would like to deposit</div>
                    <span className="topup--input">
                        <input
                            disabled={pending}
                            type="number"
                            value={value}
                            min={0}
                            onChange={this.handleChange}
                            onBlur={this.handleBlur}
                        />
                        {pending ?
                            <button disabled>Depositing...</button> :
                            <button className="hover green" onClick={this.sendFunds} disabled={disabled}>
                                <span>Deposit</span>
                            </button>
                        }
                    </span>
                </label>
                {resultMessage &&
                    <p
                        className={`${resultMessage === CONFIRMATION_MESSAGE ? "topup--input--success success" :
                            "topup--input--warning warning"}`}
                    >
                        {resultMessage}
                    </p>
                }
            </div>
        );
    }

    private readonly handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const value = event.target.value;
        this.setState({ value });

        const { traderBalance, resultMessage, disabled } = this.state;
        // If input is invalid, show an error.
        if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
            this.setState({ disabled: true });
        } else if (traderBalance.isLessThan(value)) {
            this.setState({
                resultMessage: `Insufficient balance. Maximum deposit: ${traderBalance.toFixed()}`,
                disabled: true,
            });
        } else if (resultMessage || disabled) {
            this.setState({ resultMessage: "", disabled: false });
        }
    }

    private readonly updateTraderBalance = async (): Promise<BigNumber> => {
        const { store: { address, sdk } } = this.props;

        let traderBalance;
        if (!address || !sdk) {
            traderBalance = new BigNumber(-1);
        } else {
            traderBalance = new BigNumber((await sdk.getWeb3().eth.getBalance(address)).toString())
                .div(new BigNumber(10).exponentiatedBy(18));
        }
        this.setState({ traderBalance });
        return traderBalance;
    }

    private readonly handleBlur = async (_event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const { value } = this.state;
        let traderBalance;
        try {
            traderBalance = await this.updateTraderBalance();
            if (traderBalance.isLessThan(value)) {
                this.setState({ value: traderBalance.toFixed(), disabled: true });
            }
        } catch (error) {
            _captureBackgroundException_(error, {
                description: "Error in handleBlur in TopUp",
            });
        }
    }

    private readonly sendFunds = async (): Promise<void> => {
        const { darknodeID, store: { address, sdk, tokenPrices } } = this.props;
        const { value } = this.state;

        this.setState({ resultMessage: "", pending: true });

        if (!address) {
            this.setState({ resultMessage: `Invalid account.`, pending: false });
            return;
        }

        if (!sdk) {
            this.setState({ resultMessage: `An error occurred, please refresh the page and try again.`, pending: false });
            return;
        }

        const onCancel = () => {
            try {
                this.setState({ pending: false });
            } catch (error) {
                // Ignore error
            }
        };

        const onDone = async () => {
            try {
                // tslint:disable-next-line: await-promise
                await this.props.actions.updateDarknodeStatistics(sdk, darknodeID, tokenPrices);

                this.setState({ value: "0", resultMessage: CONFIRMATION_MESSAGE, pending: false });
            } catch (error) {
                // Ignore error
            }
        };

        // tslint:disable-next-line: await-promise
        await this.props.actions.showFundPopup(sdk, address, darknodeID, value, onCancel, onDone);
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        address: state.trader.address,
        sdk: state.trader.sdk,
        tokenPrices: state.statistics.tokenPrices,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
        showFundPopup,
        updateDarknodeStatistics,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    darknodeID: string;
}

interface State {
    value: string;
    resultMessage: string;
    pending: boolean;
    disabled: boolean;
    traderBalance: BigNumber;
}

export const TopUp = connect(mapStateToProps, mapDispatchToProps)(TopUpClass);
