import { sha256, sha256FromString } from "ethereumjs-util";
import { numberToLeftPaddedUrlBase64 } from "../general/encodingUtils";

export const claimFeesDigest = (
    darknodeId: string,
    amount: number,
    address: string,
    nonce: number,
) => {
    const nodeHash = sha256(Buffer.from(darknodeId));
    const amountHash = sha256(
        Buffer.from(numberToLeftPaddedUrlBase64(amount.toString())),
    );
    const toHash = sha256FromString(address);
    const nonceHash = sha256(
        Buffer.from(numberToLeftPaddedUrlBase64(nonce.toString())),
    );

    console.info(nodeHash, amountHash, toHash, nonceHash);
    // const h01 = hash(nodeHash + amountHash);
    // const h23 = hash(toHash + nonceHash);
    return toHash;
    // return hash(h01 + h23);
};

export const toBytes32 = (value: Buffer) => {
    const bytes32 = Buffer.alloc(32, 0);
    value.copy(bytes32);
    return bytes32;
};

export const prependBytes32 = (value: number) => {
    const bytes32 = Buffer.alloc(32, 0);
    const strBuff = stringToBuffer(value.toString());
    strBuff.copy(bytes32);
    return bytes32;
};

const stringToBuffer = (str: string) => {
    const buffer = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    const bufferView = new Uint16Array(buffer);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufferView[i] = str.charCodeAt(i);
    }
    return new Buffer(buffer);
};
