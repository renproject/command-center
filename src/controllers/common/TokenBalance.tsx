import { Currency } from "@renproject/react-components";
import { BigNumber } from "bignumber.js";
import React from "react";

import { AllTokenDetails, Token } from "../../lib/ethereum/tokens";
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
