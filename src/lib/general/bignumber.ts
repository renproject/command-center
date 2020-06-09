import BigNumber from "bignumber.js";

export const renderBN = (n: BigNumber, digits?: number) => {
    return digits === undefined ? n.toFormat() : n.decimalPlaces(digits, BigNumber.ROUND_FLOOR).toFormat(digits);
};
