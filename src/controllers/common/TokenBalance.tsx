import { Currency } from "@renproject/react-components";
import { BigNumber } from "bignumber.js";
import { OrderedMap } from "immutable";
import React from "react";

import {
    AllTokenDetails,
    Token,
    TokenPrices,
    TokenString,
} from "../../lib/ethereum/tokens";
import { TokenAmount } from "../../lib/graphQL/queries/queries";
import { NetworkContainer } from "../../store/networkContainer";

interface Props {
    token: Token;
    amount: number | string | BigNumber;
    convertTo?: Currency;
    digits?: number; // Always shows this many digits (e.g. for 3 d.p.: 0.100, 0.111)
    shifted?: boolean; // determines whether the input has already been converted into its readable unit
}

const ERR = <>...</>;

export const TokenBalance: React.FC<Props> = ({
    amount,
    token,
    convertTo,
    digits,
    shifted,
}) => {
    const { tokenPrices } = NetworkContainer.useContainer();

    const tokenDetails = AllTokenDetails.get(token, undefined);
    const decimals = tokenDetails
        ? new BigNumber(tokenDetails.decimals.toString()).toNumber()
        : 0;

    const amountBN = shifted
        ? new BigNumber(amount)
        : new BigNumber(amount).div(new BigNumber(Math.pow(10, decimals)));

    if (!convertTo) {
        return (
            <>
                {digits !== undefined
                    ? amountBN.toFormat(digits)
                    : amountBN.toFormat()}
            </>
        );
    }

    if (!tokenPrices) {
        return ERR;
    }

    const tokenPriceMap = tokenPrices.get(token, undefined);
    if (!tokenPriceMap) {
        return ERR;
    }

    const price = tokenPriceMap.get(convertTo, undefined);
    if (!price) {
        return ERR;
    }

    const resolvedAmount = amountBN
        .multipliedBy(price)
        .decimalPlaces(
            digits === undefined ? 3 : digits,
            BigNumber.ROUND_FLOOR,
        );
    return <>{resolvedAmount.toFormat()}</>;
};

export const ConvertCurrency: React.FC<{
    amount: BigNumber;
    from: Currency;
    to: Currency;
}> = ({ amount, from, to }) => {
    const { tokenPrices } = NetworkContainer.useContainer();

    if (!tokenPrices) {
        return ERR;
    }

    const tokenPriceMap = tokenPrices.first(undefined);
    if (!tokenPriceMap) {
        return ERR;
    }

    const fromPrice = tokenPriceMap.get(from, undefined);
    const toPrice = tokenPriceMap.get(to, undefined);
    if (!fromPrice || !toPrice) {
        return ERR;
    }

    const resolvedAmount = amount
        .dividedBy(fromPrice)
        .multipliedBy(toPrice)
        .decimalPlaces(2, BigNumber.ROUND_FLOOR);

    // let digits = amount.gt(100000) ? 0 : 2
    const digits = amount.eq(0) ? 0 : 2;

    const formatted = resolvedAmount.toFormat(digits, BigNumber.ROUND_FLOOR);

    return <>{formatted}</>;
};

export const AnyTokenBalance: React.FC<{
    amount: number | string | BigNumber;
    decimals: number;

    // Always shows this many digits (e.g. for 3 d.p.: 0.100, 0.111).
    // Defaults to 3. Set to null to instead not truncate.
    digits?: number | null;
}> = ({ amount, decimals, digits }) => {
    const amountBN = new BigNumber(amount).div(
        new BigNumber(Math.pow(10, decimals)),
    );

    const resolvedAmount =
        digits === null
            ? amountBN
            : amountBN.decimalPlaces(
                  digits === undefined ? 3 : digits,
                  BigNumber.ROUND_FLOOR,
              );

    const formatted =
        amountBN.gt(0) && resolvedAmount.isZero()
            ? digits === null
                ? resolvedAmount.toFormat()
                : resolvedAmount.toFormat(
                      digits === undefined ? 3 : digits,
                      BigNumber.ROUND_FLOOR,
                  )
            : resolvedAmount.toFormat();

    return <>{formatted}</>;
};

export const updatePrice = <T extends TokenAmount | null | undefined>(
    amount: T,
    symbol: Token,
    tokenPrices: TokenPrices | null,
): T => {
    if (!tokenPrices) {
        return amount;
    }

    const prices = tokenPrices.get(symbol);
    if (amount && prices && amount.asset) {
        const usdPrice = prices.get(Currency.USD);
        const ethPrice = prices.get(Currency.ETH);
        const shiftedAmount = amount.amount.div(
            new BigNumber(10).exponentiatedBy(amount.asset.decimals),
        );

        return {
            ...amount,
            amountInUsd: usdPrice
                ? shiftedAmount.times(usdPrice)
                : amount.amountInUsd,
            amountInEth: ethPrice
                ? shiftedAmount.times(ethPrice)
                : amount.amountInEth,
        };
    }
    return amount;
};

/**
 * Override token values using the latest prices.
 */
export const updatePrices = <T extends TokenAmount | null | undefined>(
    tokenAmounts: OrderedMap<TokenString, T>,
    tokenPrices: TokenPrices | null,
): OrderedMap<TokenString, T> => {
    if (!tokenPrices) {
        return tokenAmounts;
    }
    return tokenAmounts.map((amount, symbol) =>
        updatePrice(amount, symbol as Token, tokenPrices),
    );
};

/**
 * Only update token values that don't already have price information.
 */
export const missingPrices = (
    tokenAmounts: OrderedMap<TokenString, TokenAmount | null>,
    tokenPrices: TokenPrices | null,
): OrderedMap<TokenString, TokenAmount | null> => {
    if (!tokenPrices) {
        return tokenAmounts;
    }

    return tokenAmounts.map((amount, symbol) => {
        const prices = tokenPrices.get(symbol as Token);
        if (
            amount &&
            amount.amount.gt(0) &&
            amount.amountInUsd.eq(0) &&
            prices
        ) {
            const usdPrice = prices.get(Currency.USD);
            const ethPrice = prices.get(Currency.ETH);
            return {
                ...amount,
                amountInUsd: usdPrice
                    ? amount.amount.times(usdPrice)
                    : amount.amountInUsd,
                amountInEth: ethPrice
                    ? amount.amount.times(ethPrice)
                    : amount.amountInEth,
            };
        }
        return amount;
    });
};
