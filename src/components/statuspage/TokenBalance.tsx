import * as React from "react";

import { BigNumber } from "bignumber.js";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { ApplicationData, Currency } from "@Reducers/types";
import { Token, TokenDetails } from "./lib/tokens";

interface TokenBalanceProps extends ReturnType<typeof mapStateToProps>, ReturnType<typeof mapDispatchToProps> {
    token: Token;
    amount: string | BigNumber;
    convertTo?: Currency;
    digits?: number;
}

interface TokenBalanceState {
}

class TokenBalanceClass extends React.Component<TokenBalanceProps, TokenBalanceState> {
    constructor(props: TokenBalanceProps) {
        super(props);
    }

    public render(): JSX.Element {
        const { token, convertTo, store, digits } = this.props;
        const { tokenPrices } = store;

        const tokenDetails = TokenDetails.get(token, undefined);

        const amount = new BigNumber(this.props.amount)
            .div(new BigNumber(Math.pow(10, tokenDetails ? tokenDetails.digits : 0)));

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
                defaultDigits = 8; break;
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
    },
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    actions: bindActionCreators({
    }, dispatch),
});

export const TokenBalance = connect(mapStateToProps, mapDispatchToProps)(TokenBalanceClass);

