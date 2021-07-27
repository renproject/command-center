import BigNumber from "bignumber.js";

// eslint-disable-next-line
export const objectify = (obj: any) => {
    if (!obj) {
        return {};
    }
    if (obj && obj.toObject) {
        return obj.toObject();
    }
    return obj;
};

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
export const replacer = createBnReplacer(numericKeys);
// eslint-disable-next-line
export const unify = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, replacer));
};

const tokenKeys = ["BTC", "ZEC", "BCH", "FIL", "DOGE", "DGB", "LUNA"];
const tokenReplacer = createBnReplacer(tokenKeys);
// eslint-disable-next-line
export const unifyTokenRecords = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, tokenReplacer));
};
