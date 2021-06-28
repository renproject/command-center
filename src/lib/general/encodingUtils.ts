import BN from "bn.js";

export const urlize = (value: string) =>
    value.replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");

export const bufferToUrlBase64 = (input: Buffer): string =>
    urlize(input.toString("base64"));

export const numberToLeftPaddedUrlBase64 = (value: number | string) => {
    const buffer = new BN(value).toArrayLike(Buffer, "be", 32);
    return bufferToUrlBase64(buffer);
};
