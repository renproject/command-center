import * as React from "react";

import { BigNumber } from "bignumber.js";
import { connect, ConnectedReturnType } from "react-redux"; // Custom typings
import { bindActionCreators, Dispatch } from "redux";

import { Token } from "../lib/ethereum/tokens";
import { ApplicationData, Currency } from "../store/types";

class TokenBalanceClass extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            decimals: 0,
        };
    }

    public componentDidMount = async (): Promise<void> => {
        const { token, store } = this.props;
        const { sdk } = store;

        if (sdk) {
            const tokenDetails = await sdk._cachedTokenDetails.get(token);

            const decimals = tokenDetails ? new BigNumber(tokenDetails.decimals.toString()).toNumber() : 0;
            this.setState({ decimals });
        }
    }

    public componentWillReceiveProps = async (nextProps: Props): Promise<void> => {
        const { token: nextToken, store } = nextProps;
        const { sdk } = store;
        const { token } = this.props;

        if (sdk && nextToken !== token) {
            const tokenDetails = await sdk._cachedTokenDetails.get(nextToken);

            const decimals = tokenDetails ? new BigNumber(tokenDetails.decimals.toString()).toNumber() : 0;
            this.setState({ decimals });
        }
    }

    public render = (): JSX.Element => {
        const { token, convertTo, store, digits } = this.props;
        const { decimals } = this.state;
        const { tokenPrices } = store;

        const amount = new BigNumber(this.props.amount)
            .div(new BigNumber(Math.pow(10, decimals)));

        if (!convertTo) {
            return <>{digits !== undefined ? amount.toFixed(digits) : amount.toFixed()}</>;
        }

        if (!tokenPrices) {
            return <>...</>;
        }

        const tokenPriceMap = tokenPrices.get(token, undefined);
        if (!tokenPriceMap) {
            return <>...</>;
        }

        const price = tokenPriceMap.get(convertTo, undefined);
        if (!price) {
            return <i>ERR</i>;
        }

        let defaultDigits;
        switch (convertTo) {
            case Currency.BTC:
            case Currency.ETH:
                defaultDigits = 3; break;
            default:
                defaultDigits = 2;
        }
        defaultDigits = digits === undefined ? defaultDigits : digits;

        return <>{amount.multipliedBy(price).toFixed(defaultDigits)}</>;
    }
}

const mapStateToProps = (state: ApplicationData) => ({
    store: {
        tokenPrices: state.statistics.tokenPrices,
        sdk: state.trader.sdk,
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

interface Props extends ReturnType<typeof mapStateToProps>, ConnectedReturnType<typeof mapDispatchToProps> {
    token: Token;
    amount: string | BigNumber;
    convertTo?: Currency;
    digits?: number;
}

interface State {
    decimals: number;
}

export const TokenBalance = connect(mapStateToProps, mapDispatchToProps)(TokenBalanceClass);
