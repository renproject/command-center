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

const numericKeys = ["amount", "amountInUsd", "amountInEth"];

// eslint-disable-next-line
export const replacer = (key: string, value: any) => {
    if (numericKeys.includes(key)) {
        if (typeof value === "object") {
            return new BigNumber({ ...value, _isBigNumber: true }).toNumber();
        } else if (typeof value === "string") {
            return Number(value);
        }
        return value;
    }
    return value;
};

// eslint-disable-next-line
export const unify = (obj: any) => {
    return JSON.parse(JSON.stringify(obj, replacer));
};
