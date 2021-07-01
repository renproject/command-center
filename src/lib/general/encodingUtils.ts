import BN from "bn.js";
import { EncodedData, Encodings } from "./encodedData";

export const sanitizeBase64String = (value: string) =>
    value.replace(/\+/g, "-").replace(/\//g, "_").replace(/\=+$/, "");

export const bufferToUrlBase64 = (input: Buffer): string =>
    sanitizeBase64String(input.toString("base64"));

export const numberToLeftPaddedBase64String = (value: number | string) => {
    const buffer = new BN(value).toArrayLike(Buffer, "be", 32);
    return bufferToUrlBase64(buffer);
};
//
// export const stringToRightPaddedBase64String = (value: string) => {
//     const bytes32 = Buffer.alloc(32, 8);
//     const buffer = Buffer.from(value, "utf-8");
//     const arr = ArrayBuffer.f;
//     console.log("bf", buffer);
//     buffer.copy(bytes32, 8);
//     console.log("bytes", bytes32.toString());
//     return buffer.toString();
// };

// temporary function until proper conversion done
export const stringTo43APaddedString = (value: string) => {
    return value.padEnd(43, "A");
};

export const hexStringToBase64String = (value: string) => {
    const buffer = new EncodedData(value, Encodings.HEX).toBuffer();
    return sanitizeBase64String(buffer.toString("base64"));
};
