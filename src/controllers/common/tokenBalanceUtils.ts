import { Currency } from "@renproject/react-components";
import { BigNumber } from "bignumber.js";
import { OrderedMap } from "immutable";
import { Token, TokenPrices, TokenString } from "../../lib/ethereum/tokens";
import { TokenAmount } from "../../lib/graphQL/queries/queries";

/**
 * Override token Eth/USD amounts with latest prices
 */
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

export const convertTokenAmount = (
    amount: BigNumber | number | string,
    token: Token,
    to: Currency,
    tokenPrices: TokenPrices,
) => {
    const fallback = new BigNumber(0);
    const tokenPriceMap = tokenPrices.get(token);
    if (!tokenPriceMap) {
        return fallback;
    }
    const toPrice = tokenPriceMap.get(to);

    if (!toPrice) {
        return fallback;
    }

    const bnAmount = new BigNumber(amount);

    return bnAmount
        .multipliedBy(toPrice)
        .decimalPlaces(2, BigNumber.ROUND_FLOOR);
};
