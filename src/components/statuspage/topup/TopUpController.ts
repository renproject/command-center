import { BigNumber } from "bignumber.js";
import { Component, createElement } from "react";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators } from "redux";

import { _captureBackgroundException_ } from "../../../lib/react/errors";
import { ApplicationState } from "../../../store/applicationState";
import { AppDispatch } from "../../../store/rootReducer";
import { updateDarknodeStatistics } from "../../../store/statistics/operatorActions";
import { showFundPopup } from "../../../store/statistics/operatorPopupActions";
import { TopUp } from "./TopUp";

export const CONFIRMATION_MESSAGE = "Transaction confirmed.";

const defaultState = { // Entries must be immutable
    value: "0.1",
    resultMessage: "",
    pending: false,
    disabled: false,
    traderBalance: new BigNumber(0),
};

class TopUpControllerClass extends Component<Props, typeof defaultState> {
    private _isMounted = false;

    constructor(props: Props) {
        super(props);
        this.state = defaultState;
    }

    public componentDidMount = async () => {
        this._isMounted = true;
        this.updateTraderBalance().catch((error) => {
            _captureBackgroundException_(error, {
                description: "Error in updateTraderBalance in TopUp",
            });
        });
    }

    public componentWillUnmount = () => {
        this._isMounted = false;
    }

    public render = (): JSX.Element => createElement(TopUp, {
        darknodeID: this.props.darknodeID,
        value: this.state.value,
        resultMessage: this.state.resultMessage,
        pending: this.state.pending,
        disabled: this.state.disabled,
        handleChange: this.handleChange,
        handleBlur: this.handleBlur,
        sendFunds: this.sendFunds,
    })

    private readonly handleChange = (value: string): void => {
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
        const { store: { address, web3 } } = this.props;

        let traderBalance;
        if (!address) {
            traderBalance = new BigNumber(-1);
        } else {
            traderBalance = new BigNumber((await web3.eth.getBalance(address)).toString())
                .div(new BigNumber(10).exponentiatedBy(18));
        }
        this.setState({ traderBalance });
        return traderBalance;
    }

    private readonly handleBlur = async (): Promise<void> => {
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
        const { darknodeID, store: { address, web3, tokenPrices, renNetwork } } = this.props;
        const { value } = this.state;

        this.setState({ resultMessage: "", pending: true });

        if (!address) {
            this.setState({ resultMessage: `Invalid account.`, pending: false });
            return;
        }

        const onCancel = () => {
            if (this._isMounted) {
                this.setState({ pending: false });
            }
        };

        const onDone = async () => {
            try {
                await this.props.actions.updateDarknodeStatistics(web3, renNetwork, darknodeID, tokenPrices);
            } catch (error) {
                // Ignore error
            }

            if (this._isMounted) {
                this.setState({ resultMessage: CONFIRMATION_MESSAGE, pending: false });

                // If the user hasn't changed the value, set it to 0.
                if (this.state.value === value) {
                    this.setState({ value: "0" });
                }
            }
        };

        // tslint:disable-next-line: await-promise
        await this.props.actions.showFundPopup(web3, address, darknodeID, value, onCancel, onDone);
    }
}

const mapStateToProps = (state: ApplicationState) => ({
    store: {
        address: state.trader.address,
        web3: state.trader.web3,
        tokenPrices: state.statistics.tokenPrices,
        renNetwork: state.trader.renNetwork,
    },
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    actions: bindActionCreators({
        showFundPopup,
        updateDarknodeStatistics,
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    darknodeID: string;
}

export const TopUpController = connect(mapStateToProps, mapDispatchToProps)(TopUpControllerClass);
