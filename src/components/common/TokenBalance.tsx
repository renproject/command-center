import * as React from "react";

import { Currency } from "@renproject/react-components";
import { BigNumber } from "bignumber.js";

import { AllTokenDetails, OldToken, Token, TokenPrices } from "../../lib/ethereum/tokens";
import { NetworkStateContainer } from "../../store/networkStateContainer";

interface Props {
    token: Token | OldToken;
    amount: number | string | BigNumber;
    convertTo?: Currency;
    digits?: number; // Always shows this many digits (e.g. for 3 d.p.: 0.100, 0.111)
}

const defaultDigits = (quoteCurrency: Currency | Token | OldToken) => {
    let digits;
    switch (quoteCurrency) {
        case Currency.BTC:
        case Currency.ETH:
        case Token.BTC:
        case Token.BCH:
        case Token.ZEC:
        case Token.ETH:
            digits = 3; break;

        default:
            digits = 2;
    }
    return digits;
};

export const tokenToReadable = (amount: number | string | BigNumber, token: Token | OldToken): BigNumber => {
    const tokenDetails = AllTokenDetails.get(token as Token, undefined);
    const decimals = tokenDetails ? new BigNumber(tokenDetails.decimals.toString()).toNumber() : 0;

    return new BigNumber(amount).div(new BigNumber(10).exponentiatedBy(decimals)).decimalPlaces(defaultDigits(token));
};

export const tokenToQuote = (amount: number | string | BigNumber, token: Token | OldToken, quoteCurrency: Currency, tokenPrices: TokenPrices): BigNumber => {
    const tokenDetails = AllTokenDetails.get(token as Token, undefined);
    const decimals = tokenDetails ? new BigNumber(tokenDetails.decimals.toString()).toNumber() : 0;
    const prices = tokenPrices.get(token);

    if (prices) {
        const price = prices.get(quoteCurrency);
        if (price) {
            return new BigNumber(amount).div(new BigNumber(10).exponentiatedBy(decimals)).times(price).decimalPlaces(defaultDigits(quoteCurrency));
        }
    }
    return new BigNumber(0);
};

export const TokenBalance: React.FC<Props> = ({ amount, token, convertTo, digits }) => {
    const { tokenPrices } = NetworkStateContainer.useContainer();

    const tokenDetails = AllTokenDetails.get(token as Token, undefined);
    const decimals = tokenDetails ? new BigNumber(tokenDetails.decimals.toString()).toNumber() : 0;

    const amountBN = new BigNumber(amount)
        .div(new BigNumber(Math.pow(10, decimals)));

    if (!convertTo) {
        return <>{digits !== undefined ? amountBN.toFixed(digits) : amountBN.toFixed()}</>;
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

    return <>{
        amountBN
            .multipliedBy(price)
            .toFixed(digits === undefined ? defaultDigits(convertTo) : digits)
    }</>;
};
