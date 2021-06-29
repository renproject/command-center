import BN from "bn.js";

export const sanitizeBase64String = (value: string) =>
    value.replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");

export const bufferToUrlBase64 = (input: Buffer): string =>
    sanitizeBase64String(input.toString("base64"));

export const numberToLeftPaddedBase64String = (value: number | string) => {
    const buffer = new BN(value).toArrayLike(Buffer, "be", 32);
    return bufferToUrlBase64(buffer);
};
