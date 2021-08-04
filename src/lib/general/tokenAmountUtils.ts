import BigNumber from "bignumber.js";

export const convertToStandardAmount = (
    baseAmount: BigNumber | string,
    decimals: number,
): BigNumber => new BigNumber(baseAmount).shiftedBy(-decimals || 0);

export const convertToBaseAmount = (
    standardAmount: BigNumber | string,
    decimals: number,
): BigNumber =>
    new BigNumber(standardAmount).multipliedBy(
        new BigNumber(Math.pow(10, decimals || 0)),
    );
