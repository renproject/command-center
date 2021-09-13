import BigNumber from "bignumber.js";

const createBnReplacer = (keys: Array<string>) => {
    return (key: string, value: any) => {
        if (keys.includes(key)) {
            if (typeof value === "object") {
                return new BigNumber({
                    ...value,
                    _isBigNumber: true,
                }).toNumber();
            } else if (typeof value === "string") {
                return Number(value);
            }
            return value;
        }
        return value;
    };
};

const numericKeys = ["amount", "amountInUsd", "amountInEth"];
const replacer = createBnReplacer(numericKeys);
// eslint-disable-next-line
export const unify = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, replacer));
};
