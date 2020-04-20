import * as React from "react";

import { Currency } from "@renproject/react-components";
import { BigNumber } from "bignumber.js";

import { AllTokenDetails, OldToken, Token } from "../../lib/ethereum/tokens";
import { NetworkStateContainer } from "../../store/networkStateContainer";

interface Props {
    token: Token | OldToken;
    amount: number | string | BigNumber;
    convertTo?: Currency;
    digits?: number; // Always shows this many digits (e.g. for 3 d.p.: 0.100, 0.111)
}

export const TokenBalance = (props: Props) => {
    const { token, convertTo, digits } = props;
    const { tokenPrices } = NetworkStateContainer.useContainer();

    const tokenDetails = AllTokenDetails.get(token as Token, undefined);
    const decimals = tokenDetails ? new BigNumber(tokenDetails.decimals.toString()).toNumber() : 0;

    const amount = new BigNumber(props.amount)
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
};
