import BN from "bn.js";
import { Simulate } from "react-dom/test-utils";

export const sanitizeBase64String = (value: string) =>
    value.replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");

export const bufferToUrlBase64 = (input: Buffer): string =>
    sanitizeBase64String(input.toString("base64"));

export const numberToLeftPaddedBase64String = (value: number | string) => {
    const buffer = new BN(value).toArrayLike(Buffer, "be", 32);
    return bufferToUrlBase64(buffer);
};

export const stringToRightPaddedBase64String = (value: string) => {
    const bytes32 = Buffer.alloc(32, 0);
    const buffer = Buffer.from(value, "utf-8");
    console.log("bf", buffer);
    // buffer.copy(bytes32, 8);
    console.log("bytes", bytes32.toString());
    return bufferToUrlBase64(buffer);
};
