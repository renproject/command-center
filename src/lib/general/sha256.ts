import { sha256 } from "ethereumjs-util";
import { sanitizeBase64String } from "./encodingUtils";

export const base64Sha256FromUtf8String = (value: string) => {
    const buffer = Buffer.from(value, "utf8");
    return sanitizeBase64String(sha256(buffer).toString("base64"));
};

export const base64Sha256FromBase64String = (value: string) => {
    const buffer = Buffer.from(value, "base64");
    return sanitizeBase64String(sha256(buffer).toString("base64"));
};

export const base64Sha256FromTwoBase64Strings = (
    first: string,
    second: string,
) => {
    const firstBuffer = Buffer.from(first, "base64");
    const secondBuffer = Buffer.from(second, "base64");
    const buffer = Buffer.concat([firstBuffer, secondBuffer]);
    return sanitizeBase64String(sha256(buffer).toString("base64"));
};
